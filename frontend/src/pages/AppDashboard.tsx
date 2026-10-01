import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ConstraintPanel } from '../components/ConstraintPanel';
import { MapView } from '../components/MapView';
import { AreaCard } from '../components/AreaCard';
import { AreaDetailModal } from '../components/AreaDetailModal';
import { ExclusionDisclaimer } from '../components/ExclusionDisclaimer';
import { CompareModal } from '../components/CompareModal';
import { OnboardingModal } from '../components/OnboardingModal';
import { SkeletonList } from '../components/SkeletonList';
import { IngestionProgressModal } from '../components/IngestionProgressModal';
import { fetchWorkplaces, fetchRecommendations, checkCityStatusApi, ingestCityApi } from '../services/api';
import { CityId, FilterState, RankedNeighborhood, RecommendationResponse, Workplace } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sparkles,
  Layers,
  FilterX,
  Bookmark,
  Scale,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  X,
  CheckCircle2,
  Columns2,
  LayoutGrid,
  Map as MapIcon,
  Search,
  Train,
  Clock,
  IndianRupee,
  HelpCircle,
  Info
} from 'lucide-react';

const DEFAULT_WORKPLACES: Record<string, { name: string; lat: number; lon: number }> = {
  bangalore: {
    name: 'RMZ Ecospace / Ecoworld (ORR)',
    lat: 12.9279,
    lon: 77.6848
  },
  pune: {
    name: 'Rajiv Gandhi Infotech Park (Hinjawadi Ph 1)',
    lat: 18.5913,
    lon: 73.7389
  }
};

type ViewMode = 'split' | 'list' | 'map';

export const AppDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize City from URL or default to 'bangalore'
  const initialCity = (searchParams.get('city') as CityId) || 'bangalore';
  const initialTransit = (searchParams.get('mode') as 'driving' | 'transit') || 'driving';
  const initialBed = (searchParams.get('bed') as '1bhk' | '2bhk') || '1bhk';
  const initialAlgo = (searchParams.get('algo') as 'pareto' | 'weighted') || 'pareto';
  const initialRent = searchParams.get('rent') ? Number(searchParams.get('rent')) : undefined;
  const initialCommute = searchParams.get('commute') ? Number(searchParams.get('commute')) : undefined;
  const initialAqi = searchParams.get('aqi') ? Number(searchParams.get('aqi')) : undefined;
  const initialHosp = searchParams.get('hosp') ? Number(searchParams.get('hosp')) : undefined;
  const initialGroc = searchParams.get('groc') ? Number(searchParams.get('groc')) : undefined;
  const initialWpName = searchParams.get('wp');

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissRentNotice, setDismissRentNotice] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestingCityName, setIngestingCityName] = useState('');

  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    city: initialCity,
    workplace: DEFAULT_WORKPLACES[initialCity] || {
      name: `${initialCity.charAt(0).toUpperCase() + initialCity.slice(1)} Central CBD`,
      lat: 26.9124,
      lon: 75.7873
    },
    transitMode: initialTransit,
    bedroomType: initialBed,
    algorithm: initialAlgo,
    weights: [0.3, 0.3, 0.15, 0.15, 0.1],
    maxRent: initialRent,
    maxCommuteMinutes: initialCommute,
    maxAqi: initialAqi,
    minHospitals: initialHosp,
    minGroceries: initialGroc,
    paretoOnly: false
  });

  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<RankedNeighborhood | null>(null);
  const [hoveredArea, setHoveredArea] = useState<RankedNeighborhood | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'frontier' | 'all' | 'saved' | 'excluded'>('frontier');
  const [metroOnlyFilter, setMetroOnlyFilter] = useState(false);

  // Comparison State (up to 3 items)
  const [comparedAreas, setComparedAreas] = useState<RankedNeighborhood[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  // Saved / Bookmarked items (localStorage)
  const [savedKeys, setSavedKeys] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('nestfit_saved_keys');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Onboarding walkthrough modal state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    if (searchParams.get('tour') === 'true') return true;
    return !localStorage.getItem('nestfit_onboarding_completed_v2') && searchParams.get('notour') !== 'true';
  });

  // Auto-open compare modal if ?compare=true
  useEffect(() => {
    if (searchParams.get('compare') === 'true' && recommendations && recommendations.paretoFrontier.length >= 2) {
      setComparedAreas(recommendations.paretoFrontier.slice(0, 3));
      setIsCompareOpen(true);
    }
  }, [recommendations, searchParams]);

  const [showToast, setShowToast] = useState<string | null>(null);

  // Sync Saved items with localStorage
  const handleToggleSave = (key: string) => {
    setSavedKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      try {
        localStorage.setItem('nestfit_saved_keys', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save to localStorage', err);
      }
      return next;
    });
  };

  // Compare Toggle handler
  const handleToggleCompare = (area: RankedNeighborhood) => {
    setComparedAreas((prev) => {
      const exists = prev.some((a) => a.key === area.key);
      if (exists) {
        return prev.filter((a) => a.key !== area.key);
      }
      if (prev.length >= 3) {
        setShowToast('You can compare up to 3 neighborhoods side-by-side.');
        setTimeout(() => setShowToast(null), 3000);
        return prev;
      }
      return [...prev, area];
    });
  };

  // Sync URL search params
  const updateUrlParams = useCallback((currentFilters: FilterState) => {
    const params = new URLSearchParams(window.location.search);
    params.set('city', currentFilters.city);
    params.set('wp', currentFilters.workplace.name);
    params.set('mode', currentFilters.transitMode);
    params.set('bed', currentFilters.bedroomType);
    params.set('algo', currentFilters.algorithm);

    if (currentFilters.maxRent !== undefined) params.set('rent', String(currentFilters.maxRent));
    if (currentFilters.maxCommuteMinutes !== undefined) params.set('commute', String(currentFilters.maxCommuteMinutes));
    if (currentFilters.maxAqi !== undefined) params.set('aqi', String(currentFilters.maxAqi));
    if (currentFilters.minHospitals !== undefined) params.set('hosp', String(currentFilters.minHospitals));
    if (currentFilters.minGroceries !== undefined) params.set('groc', String(currentFilters.minGroceries));

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Load workplaces whenever city changes
  useEffect(() => {
    let isSubscribed = true;
    fetchWorkplaces(filters.city)
      .then((data) => {
        if (!isSubscribed) return;
        setWorkplaces(data);

        const match = initialWpName ? data.find((w) => w.name === initialWpName) : null;
        const currentMatch = data.find((w) => w.name === filters.workplace.name);

        if (match) {
          setFilters((prev) => ({
            ...prev,
            workplace: { name: match.name, lat: match.centroid[1], lon: match.centroid[0] }
          }));
        } else if (!currentMatch && data.length > 0) {
          setFilters((prev) => ({
            ...prev,
            workplace: { name: data[0].name, lat: data[0].centroid[1], lon: data[0].centroid[0] }
          }));
        }
      })
      .catch((err) => {
        console.error('Failed to load workplaces for city:', filters.city, err);
      });

    return () => {
      isSubscribed = false;
    };
  }, [filters.city]);

  // Debounced Recommendation Fetch
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    const handler = setTimeout(() => {
      updateUrlParams(filters);
      fetchRecommendations(filters)
        .then((res) => {
          setRecommendations(res);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Recommendation fetch error:', err);
          setIsLoading(false);
          setHasError(true);
          setErrorMessage(err.message || 'Unable to compute recommendations from backend engine.');
        });
    }, 250);

    return () => clearTimeout(handler);
  }, [filters, updateUrlParams]);

  const handleCityChange = async (
    newCityKey: string,
    cityName?: string,
    isCached?: boolean,
    lat?: number,
    lon?: number
  ) => {
    if (newCityKey === filters.city) return;
    setComparedAreas([]);
    setDismissRentNotice(false);

    let cached = isCached;
    if (cached === undefined && !['bangalore', 'pune'].includes(newCityKey)) {
      try {
        const status = await checkCityStatusApi(newCityKey);
        cached = status.isCached || status.isPreWarmed;
      } catch {
        cached = false;
      }
    }

    if (!cached && !['bangalore', 'pune'].includes(newCityKey)) {
      const displayCityName = cityName || newCityKey.charAt(0).toUpperCase() + newCityKey.slice(1);
      setIngestingCityName(displayCityName);
      setIsIngesting(true);

      try {
        const ingestResult = await ingestCityApi(newCityKey);
        const cityData = ingestResult.city;
        const defaultWp = cityData.defaultWorkplaces?.[0] || {
          name: `${cityData.name} Central CBD`,
          centroid: [cityData.center[1], cityData.center[0]]
        };

        setWorkplaces(cityData.defaultWorkplaces || []);
        setFilters((prev) => ({
          ...prev,
          city: newCityKey,
          workplace: { name: defaultWp.name, lat: defaultWp.centroid[1], lon: defaultWp.centroid[0] }
        }));
        setIsIngesting(false);
      } catch (err) {
        console.error('Dynamic ingestion failed:', err);
        setIsIngesting(false);
        setHasError(true);
        setErrorMessage(`Failed to ingest new city: ${(err as Error).message}`);
      }
    } else {
      const defaultWp = DEFAULT_WORKPLACES[newCityKey] || {
        name: `${newCityKey.charAt(0).toUpperCase() + newCityKey.slice(1)} Central CBD`,
        lat: lat || 12.9716,
        lon: lon || 77.5946
      };

      setFilters((prev) => ({
        ...prev,
        city: newCityKey,
        workplace: defaultWp,
        maxRent: undefined,
        maxCommuteMinutes: undefined
      }));
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    const defaultWp = workplaces.length > 0
      ? { name: workplaces[0].name, lat: workplaces[0].centroid[1], lon: workplaces[0].centroid[0] }
      : DEFAULT_WORKPLACES[filters.city];

    setFilters({
      city: filters.city,
      workplace: defaultWp,
      transitMode: 'driving',
      bedroomType: '1bhk',
      algorithm: 'pareto',
      weights: [0.3, 0.3, 0.15, 0.15, 0.1],
      maxRent: undefined,
      maxCommuteMinutes: undefined,
      maxAqi: undefined,
      minHospitals: undefined,
      minGroceries: undefined,
      paretoOnly: false
    });
    setMetroOnlyFilter(false);
    setSearchQuery('');
  };

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    try {
      localStorage.setItem('nestfit_onboarding_completed_v2', 'true');
    } catch {}
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast('Filtered view URL copied to clipboard');
    setTimeout(() => setShowToast(null), 2500);
  };

  // Compile active list based on selected tab and secondary filters
  const getDisplayAreas = (): { areas: RankedNeighborhood[]; isExcluded: boolean } => {
    if (!recommendations) return { areas: [], isExcluded: false };

    const allNeighborhoods = [
      ...recommendations.paretoFrontier,
      ...recommendations.otherRanks,
      ...recommendations.excluded
    ];

    let baseList: RankedNeighborhood[] = [];
    let isExcludedTab = false;

    if (activeTab === 'frontier') {
      baseList = recommendations.paretoFrontier;
    } else if (activeTab === 'saved') {
      baseList = allNeighborhoods.filter((a) => savedKeys.includes(a.key));
    } else if (activeTab === 'excluded') {
      baseList = recommendations.excluded;
      isExcludedTab = true;
    } else {
      baseList = [...recommendations.paretoFrontier, ...recommendations.otherRanks];
    }

    if (metroOnlyFilter) {
      baseList = baseList.filter((a) => a.metroConnected);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      baseList = baseList.filter(
        (a) => a.name.toLowerCase().includes(q) || a.zone.toLowerCase().includes(q)
      );
    }

    return { areas: baseList, isExcluded: isExcludedTab };
  };

  const { areas: displayAreas, isExcluded: tabIsExcluded } = getDisplayAreas();

  const activeConstraintCount = [
    filters.maxRent !== undefined,
    filters.maxCommuteMinutes !== undefined,
    filters.maxAqi !== undefined,
    (filters.minHospitals || 0) > 0,
    (filters.minGroceries || 0) > 0,
    metroOnlyFilter,
    searchQuery.trim().length > 0
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#E2E8F0] flex flex-col font-sans selection:bg-[#0D9488]/30 selection:text-white antialiased">
      {/* 1. App Top Navigation Bar */}
      <Navbar
        city={filters.city}
        onCityChange={handleCityChange}
        algorithm={filters.algorithm}
        optimalCount={recommendations?.paretoOptimalCount ?? 0}
        compareCount={comparedAreas.length}
        savedCount={savedKeys.length}
        onOpenCompare={() => {
          if (comparedAreas.length > 0) setIsCompareOpen(true);
          else {
            setShowToast('Select 2 or 3 neighborhood cards using the "Compare" checkbox first.');
            setTimeout(() => setShowToast(null), 3000);
          }
        }}
        onOpenSaved={() => setActiveTab('saved')}
        onOpenTour={() => setIsOnboardingOpen(true)}
        onOpenInfo={() => setShowDisclaimer(true)}
        onShare={handleShareLink}
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#1A2332] text-[#E2E8F0] font-medium text-xs shadow-elevated flex items-center gap-2 border border-[#1F2937]"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top Executive Sub-Header / Quick Action Toolbar */}
      <div className="border-b border-[#1F2937] bg-[#0B1120] sticky top-16 z-30">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Destination summary */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#141B2D] border border-[#1F2937] text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
              <span className="text-[#94A3B8]">Target:</span>
              <strong className="text-[#E2E8F0] font-medium max-w-[200px] truncate">
                {filters.workplace.name}
              </strong>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141B2D] border border-[#1F2937] text-xs">
              <span className="text-[#94A3B8]">Frontier:</span>
              <strong className="text-[#0D9488] font-mono font-medium">
                {recommendations ? recommendations.paretoOptimalCount : 0} Front 1
              </strong>
              <span className="text-[#64748B] text-[11px]">
                ({recommendations?.executionTimeMs?.toFixed(1) || '0.8'}ms)
              </span>
            </div>
          </div>

          {/* Center: Search & Quick Preset Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Filter Search Box */}
            <div className="relative">
              <Search className="w-3 h-3 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#141B2D] border border-[#1F2937] rounded-md pl-7 pr-3 py-1 text-xs text-[#E2E8F0] placeholder:text-[#64748B] focus:outline-none focus:border-[#0D9488] transition-colors w-32 sm:w-40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#E2E8F0]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Preset Filter Chips */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleFilterChange({
                    maxCommuteMinutes: filters.maxCommuteMinutes === 30 ? undefined : 30
                  })
                }
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  filters.maxCommuteMinutes === 30
                    ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                    : 'bg-transparent text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#141B2D] border border-[#1F2937]'
                }`}
              >
                <Clock className="w-3 h-3 text-[#64748B]" />
                <span>≤ 30 mins</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleFilterChange({
                    maxRent: filters.maxRent === 25000 ? undefined : 25000
                  })
                }
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  filters.maxRent === 25000
                    ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                    : 'bg-transparent text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#141B2D] border border-[#1F2937]'
                }`}
              >
                <IndianRupee className="w-3 h-3 text-[#64748B]" />
                <span>≤ ₹25k</span>
              </button>

              <button
                type="button"
                onClick={() => setMetroOnlyFilter(!metroOnlyFilter)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  metroOnlyFilter
                    ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                    : 'bg-transparent text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#141B2D] border border-[#1F2937]'
                }`}
              >
                <Train className="w-3 h-3 text-[#64748B]" />
                <span>Metro Connected</span>
              </button>
            </div>

            {/* Clear Filters Indicator */}
            {activeConstraintCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="px-2 py-1 rounded-md text-[11px] font-medium text-[#94A3B8] hover:text-[#E2E8F0] bg-[#141B2D] border border-[#1F2937] transition-colors flex items-center gap-1"
                title="Clear active criteria"
              >
                <FilterX className="w-3 h-3" />
                <span>Clear ({activeConstraintCount})</span>
              </button>
            )}
          </div>

          {/* Right: Layout View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-[#141B2D] rounded-lg border border-[#1F2937] text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'split'
                  ? 'bg-[#1A2332] text-[#E2E8F0] border border-[#374151]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
              title="Split View: Cards and Map side-by-side"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#1A2332] text-[#E2E8F0] border border-[#374151]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
              title="Cards Only view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cards</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'map'
                  ? 'bg-[#1A2332] text-[#E2E8F0] border border-[#374151]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
              title="Map Focus view"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Layout */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Error Notice */}
        {hasError && (
          <div className="mb-5 p-3 rounded-lg bg-[#141B2D] border border-rose-900/50 text-rose-300 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <div>
                <span className="font-semibold text-rose-200">Recommendation computation error: </span>
                <span className="text-[#94A3B8]">{errorMessage}</span>
              </div>
            </div>
            <button
              onClick={() => handleFilterChange({})}
              className="px-2.5 py-1 rounded text-xs font-medium bg-[#1A2332] text-[#E2E8F0] hover:bg-[#253043] border border-[#1F2937] transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW MODE 1: SPLIT VIEW (Sidebar + Cards Feed + Sticky Map)    */}
        {/* ============================================================== */}
        {viewMode === 'split' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Sidebar: ConstraintPanel */}
            <div className="w-full lg:w-[350px] shrink-0 space-y-4 lg:sticky lg:top-36">
              <ConstraintPanel
                filters={filters}
                workplaces={workplaces}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />

              {/* Explainer Box */}
              <div className="p-4 rounded-xl bg-[#141B2D] border border-[#1F2937] text-xs space-y-1.5 shadow-card">
                <div className="flex items-center gap-1.5 font-medium text-[#E2E8F0]">
                  <HelpCircle className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>Trade-off Analysis</span>
                </div>
                <p className="text-[#64748B] text-[11px] leading-relaxed">
                  {recommendations?.tradeoffAnalysis ||
                    `NestFit's algorithm partitions neighborhoods into non-dominated Pareto fronts. Front 1 contains micro-markets where no alternative is strictly superior across all criteria.`}
                </p>
              </div>
            </div>

            {/* Middle Column: Results Feed & Filter Tabs */}
            <div className="w-full lg:w-[480px] xl:w-[520px] 2xl:w-[560px] shrink-0 space-y-4">
              {/* Quiet, Collapsible Rent Disclosure Notice */}
              {recommendations && recommendations.hasRentData === false && !dismissRentNotice && (
                <div className="p-3 rounded-xl bg-[#141B2D] border border-amber-900/40 text-xs flex items-start justify-between gap-3 shadow-card">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#D97706]">
                        Rental survey unavailable for {filters.city.toUpperCase()}
                      </span>
                      <p className="text-[#94A3B8] text-[11px] mt-0.5 leading-relaxed">
                        To maintain data integrity, unverified rental figures are not synthesized. Optimization is evaluating Commute, AQI, Healthcare, and Groceries.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDismissRentNotice(true)}
                    className="text-[#64748B] hover:text-[#94A3B8] p-0.5"
                    title="Dismiss notice"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Results Navigation Tabs */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#1F2937]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab('frontier')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'frontier'
                        ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                        : 'bg-transparent text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#141B2D] border border-[#1F2937]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Frontier ({recommendations ? recommendations.paretoFrontier.length : 0})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'all'
                        ? 'bg-[#1A2332] text-[#E2E8F0] border border-[#374151]'
                        : 'bg-transparent text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#141B2D] border border-[#1F2937]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>
                      All (
                      {recommendations
                        ? recommendations.paretoFrontier.length + recommendations.otherRanks.length
                        : 0}
                      )
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'saved'
                        ? 'bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30'
                        : 'bg-transparent text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#141B2D] border border-[#1F2937]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Saved ({savedKeys.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('excluded')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'excluded'
                        ? 'bg-[#1A2332] text-[#94A3B8] border border-[#374151]'
                        : 'bg-transparent text-[#64748B] hover:text-[#94A3B8] hover:bg-[#141B2D] border border-[#1F2937]'
                    }`}
                  >
                    <FilterX className="w-3.5 h-3.5" />
                    <span>Excluded ({recommendations ? recommendations.excluded.length : 0})</span>
                  </button>
                </div>

                <div className="text-[11px] text-[#64748B] hidden sm:block shrink-0 font-mono">
                  {displayAreas.length} results
                </div>
              </div>

              {/* Area Card Feed */}
              {isLoading && !recommendations ? (
                <SkeletonList />
              ) : displayAreas.length === 0 ? (
                <div className="bg-[#141B2D] rounded-xl p-8 text-center border border-[#1F2937] space-y-3 shadow-card">
                  <div className="w-10 h-10 rounded-lg bg-[#1A2332] border border-[#1F2937] text-[#64748B] mx-auto flex items-center justify-center">
                    <FilterX className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-[#E2E8F0] text-sm">
                      {activeTab === 'saved' ? 'No Saved Micro-Markets' : 'No Areas Match Current Criteria'}
                    </h3>
                    <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                      {activeTab === 'saved'
                        ? 'Click the bookmark icon on any card to save it for quick review.'
                        : 'Try widening your commute tolerance or adjusting your maximum rent limit.'}
                    </p>
                  </div>
                  {activeTab !== 'saved' && (
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0D9488] text-white hover:bg-[#0F766E] transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {displayAreas.map((area) => (
                    <AreaCard
                      key={area.key}
                      area={area}
                      isExcluded={tabIsExcluded}
                      isSaved={savedKeys.includes(area.key)}
                      isCompared={comparedAreas.some((a) => a.key === area.key)}
                      onToggleSave={handleToggleSave}
                      onToggleCompare={handleToggleCompare}
                      onSelect={setSelectedArea}
                      onHover={setHoveredArea}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Sticky Interactive Leaflet Map View */}
            <div className="flex-1 w-full min-h-[460px] lg:min-h-0 lg:sticky lg:top-36 lg:h-[calc(100vh-10.5rem)] rounded-xl overflow-hidden shadow-card">
              <MapView
                city={filters.city}
                workplace={filters.workplace}
                neighborhoods={
                  recommendations
                    ? [
                        ...recommendations.paretoFrontier,
                        ...recommendations.otherRanks,
                        ...recommendations.excluded
                      ]
                    : []
                }
                selectedArea={selectedArea}
                hoveredArea={hoveredArea}
                onSelectArea={setSelectedArea}
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW MODE 2: CARDS ONLY (Sidebar + Wide 2-Column Grid)        */}
        {/* ============================================================== */}
        {viewMode === 'list' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Sidebar */}
            <div className="w-full lg:w-[350px] shrink-0 space-y-4 lg:sticky lg:top-36">
              <ConstraintPanel
                filters={filters}
                workplaces={workplaces}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>

            {/* Right: 2-Column Cards Grid */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#1F2937]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab('frontier')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'frontier'
                        ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                        : 'bg-transparent text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#141B2D] border border-[#1F2937]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Frontier ({recommendations ? recommendations.paretoFrontier.length : 0})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'all'
                        ? 'bg-[#1A2332] text-[#E2E8F0] border border-[#374151]'
                        : 'bg-transparent text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#141B2D] border border-[#1F2937]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>All Eligible</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'saved'
                        ? 'bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30'
                        : 'bg-transparent text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#141B2D] border border-[#1F2937]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Saved ({savedKeys.length})</span>
                  </button>
                </div>

                <div className="text-xs text-[#64748B] font-mono">
                  {displayAreas.length} micro-markets
                </div>
              </div>

              {isLoading && !recommendations ? (
                <SkeletonList />
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                  {displayAreas.map((area) => (
                    <AreaCard
                      key={area.key}
                      area={area}
                      isExcluded={tabIsExcluded}
                      isSaved={savedKeys.includes(area.key)}
                      isCompared={comparedAreas.some((a) => a.key === area.key)}
                      onToggleSave={handleToggleSave}
                      onToggleCompare={handleToggleCompare}
                      onSelect={setSelectedArea}
                      onHover={setHoveredArea}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW MODE 3: MAP FOCUS (Expansive Map + Floating Micro-Cards) */}
        {/* ============================================================== */}
        {viewMode === 'map' && (
          <div className="space-y-4">
            <div className="h-[calc(100vh-13rem)] w-full rounded-xl overflow-hidden border border-[#1F2937] shadow-card relative">
              <MapView
                city={filters.city}
                workplace={filters.workplace}
                neighborhoods={
                  recommendations
                    ? [
                        ...recommendations.paretoFrontier,
                        ...recommendations.otherRanks,
                        ...recommendations.excluded
                      ]
                    : []
                }
                selectedArea={selectedArea}
                hoveredArea={hoveredArea}
                onSelectArea={setSelectedArea}
              />

              {/* Floating Bottom Strip of Top Candidates */}
              <div className="absolute bottom-4 left-4 right-4 z-[400] flex gap-2.5 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
                {displayAreas.slice(0, 6).map((area) => (
                  <div
                    key={area.key}
                    onClick={() => setSelectedArea(area)}
                    onMouseEnter={() => setHoveredArea(area)}
                    onMouseLeave={() => setHoveredArea(null)}
                    className="bg-[#141B2D] p-3 rounded-lg border border-[#1F2937] shadow-card min-w-[240px] max-w-[260px] shrink-0 cursor-pointer hover:border-[#0D9488] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-[#E2E8F0] font-medium truncate">{area.name}</strong>
                      <span className="text-[10px] font-mono text-[#0D9488]">Front {area.rank}</span>
                    </div>
                    <div className="mt-1.5 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#64748B]">Rent:</span>
                        <b className="text-[#E2E8F0] block font-mono text-xs">
                          {area.rent ? `₹${area.rent.toLocaleString('en-IN')}` : 'Unsurveyed'}
                        </b>
                      </div>
                      <div>
                        <span className="text-[#64748B]">Commute:</span>
                        <b className="text-[#E2E8F0] block font-mono text-xs">{Math.round(area.commuteMinutes)}m</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Comparison Drawer (when items selected) */}
      <AnimatePresence>
        {comparedAreas.length > 0 && (
          <motion.aside
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            aria-label="Neighborhood Comparison Drawer"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] bg-[#1A2332] border border-[#1F2937] rounded-xl p-3 shadow-modal flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              <span className="text-xs font-medium text-[#94A3B8] flex items-center gap-1.5 shrink-0 pl-1">
                <Scale className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Compare:</span>
              </span>
              {comparedAreas.map((area) => (
                <span
                  key={area.key}
                  className="px-2.5 py-1 rounded-md bg-[#141B2D] border border-[#1F2937] text-xs font-medium text-[#E2E8F0] flex items-center gap-1.5 shrink-0"
                >
                  <span>{area.name}</span>
                  <button
                    onClick={() => handleToggleCompare(area)}
                    className="text-[#64748B] hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setComparedAreas([])}
                className="text-xs text-[#64748B] hover:text-[#94A3B8] px-2 py-1 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setIsCompareOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium text-xs transition-colors shadow-card flex items-center gap-1.5"
              >
                <span>Launch Compare</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#1F2937] bg-[#0B1120] py-6 text-xs text-[#64748B]">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#94A3B8]">NestFit</span>
            <span>•</span>
            <span className="capitalize">{filters.city} Multi-Factor Location Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-[#64748B]">
            <button
              onClick={() => setShowDisclaimer(true)}
              className="hover:text-[#94A3B8] transition-colors"
            >
              Data Ethics & Limitations
            </button>
            <span>•</span>
            <span>OSRM + OSM Overpass + CPCB CAAQMS</span>
          </div>
        </div>
      </footer>

      {/* Neighborhood Deep-Dive Modal */}
      <AreaDetailModal
        area={selectedArea}
        workplaceName={filters.workplace.name}
        onClose={() => setSelectedArea(null)}
      />

      {/* Multi-Neighborhood Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        areas={comparedAreas}
        onRemoveArea={(key) => setComparedAreas((prev) => prev.filter((a) => a.key !== key))}
        onClear={() => setComparedAreas([])}
        onClose={() => setIsCompareOpen(false)}
      />

      {/* Safety Data Exclusion Disclaimer Modal */}
      <ExclusionDisclaimer
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      />

      {/* 4-Step Onboarding Walkthrough Tour */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={handleCloseOnboarding}
      />

      {/* On-Demand Dynamic Ingestion Progress Modal */}
      <IngestionProgressModal
        cityName={ingestingCityName}
        isOpen={isIngesting}
      />
    </div>
  );
};
