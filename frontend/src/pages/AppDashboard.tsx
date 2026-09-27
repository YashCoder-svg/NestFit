import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  HelpCircle,
  Bookmark,
  Scale,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  X,
  CheckCircle2
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

        // Check if current workplace exists in this city's workplaces
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
    }, 250); // 250ms debounce for live slider responsiveness

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

    // 1. Check if city is cached or pre-warmed
    let cached = isCached;
    if (cached === undefined && !['bangalore', 'pune'].includes(newCityKey)) {
      try {
        const status = await checkCityStatusApi(newCityKey);
        cached = status.isCached || status.isPreWarmed;
      } catch {
        cached = false;
      }
    }

    // 2. If uncached, trigger live on-demand ingestion modal
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
          city: cityData.cityKey,
          workplace: {
            name: defaultWp.name,
            lat: defaultWp.centroid[1],
            lon: defaultWp.centroid[0]
          }
        }));
      } catch (err: any) {
        console.error('Ingestion failed:', err);
        setHasError(true);
        setErrorMessage(`Failed to ingest city "${displayCityName}": ${err.message}`);
      } finally {
        setIsIngesting(false);
      }
    } else {
      // 3. Pre-warmed or already cached (< 7 days)
      const defaultWp = DEFAULT_WORKPLACES[newCityKey] || {
        name: `${(cityName || newCityKey).charAt(0).toUpperCase() + (cityName || newCityKey).slice(1)} Central CBD`,
        lat: lat || 26.9124,
        lon: lon || 75.7873
      };

      setFilters((prev) => ({
        ...prev,
        city: newCityKey,
        workplace: defaultWp
      }));
    }
  };


  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    const defaultWp = workplaces[0]
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
  };

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    try {
      localStorage.setItem('nestfit_onboarding_completed_v2', 'true');
    } catch {}
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast('Filtered view URL copied to clipboard!');
    setTimeout(() => setShowToast(null), 3000);
  };

  // Compile active list based on selected tab
  const getDisplayAreas = (): { areas: RankedNeighborhood[]; isExcluded: boolean } => {
    if (!recommendations) return { areas: [], isExcluded: false };

    const allNeighborhoods = [
      ...recommendations.paretoFrontier,
      ...recommendations.otherRanks,
      ...recommendations.excluded
    ];

    if (activeTab === 'frontier') {
      return { areas: recommendations.paretoFrontier, isExcluded: false };
    }
    if (activeTab === 'saved') {
      const saved = allNeighborhoods.filter((a) => savedKeys.includes(a.key));
      return { areas: saved, isExcluded: false };
    }
    if (activeTab === 'excluded') {
      return { areas: recommendations.excluded, isExcluded: true };
    }
    // 'all' includes frontier + dominated
    return {
      areas: [...recommendations.paretoFrontier, ...recommendations.otherRanks],
      isExcluded: false
    };
  };

  const { areas: displayAreas, isExcluded: tabIsExcluded } = getDisplayAreas();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. App Navbar with Controls */}
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
            setTimeout(() => setShowToast(null), 3500);
          }
        }}
        onOpenSaved={() => setActiveTab('saved')}
        onOpenTour={() => setIsOnboardingOpen(true)}
        onOpenInfo={() => setShowDisclaimer(true)}
        onShare={handleShareLink}
      />

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Workspace (Split-View Layout with Breathing Room) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Error State Banner */}
        {hasError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <div>
                <p className="font-bold text-sm">Failed to recalculate recommendations</p>
                <p className="text-xs text-rose-300/80">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => handleFilterChange({})}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Rent Notice for Ingested City without Curated Survey */}
        {recommendations && recommendations.hasRentData === false && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-200">
                Rent Benchmark Not Surveyed for {filters.city.toUpperCase()}
              </p>
              <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                To uphold spatial data integrity, NestFit strictly does not guess or fabricate rental numbers.
                Pareto optimization is currently running on the 4 verified dimensions (Commute Duration, Ambient Air Quality, Healthcare Facilities, and Grocery Density).
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Filter / Constraint Panel */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <ConstraintPanel
              filters={filters}
              workplaces={workplaces}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />

            {/* Algorithm Trade-off Context Box */}
            <div className="p-5 rounded-3xl glass-panel border border-slate-800 text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pareto Frontier vs Weighted Scoring</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {recommendations?.tradeoffAnalysis ||
                  `Arbitrary weights (e.g. 0.4*Rent + 0.3*Commute) conceal irreconcilable trade-offs. ` +
                  `NestFit's non-dominated sorting identifies the mathematical Pareto frontier: neighborhoods where no alternative is strictly better in all dimensions without sacrifice.`}
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Map & Results List */}
          <div className="lg:col-span-8 space-y-6">
            {/* Interactive Leaflet Map (Free CartoDB Tiles) */}
            <div className="h-[360px] sm:h-[420px] w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
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

            {/* Sparse Data Warning / Voronoi Provenance Notice */}
            {recommendations && (recommendations.sparseDataWarning || recommendations.isGridFallback) && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 backdrop-blur-md">
                <span className="text-base mt-0.5">ℹ️</span>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <span>Sparse City Micro-Market Notice</span>
                    {recommendations.isGridFallback && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded text-[10px] normal-case font-normal">
                        Spatial Voronoi Grid
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {recommendations.sparseDataNotice ||
                      "Limited distinct areas detected for this city — results may be less differentiated than metro areas with denser data."}
                  </p>
                </div>
              </div>
            )}

            {/* Results Navigation Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab('frontier')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'frontier'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    Pareto Frontier ({recommendations ? recommendations.paretoFrontier.length : 0})
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'all'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>
                    All Eligible (
                    {recommendations
                      ? recommendations.paretoFrontier.length + recommendations.otherRanks.length
                      : 0}
                    )
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'saved'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Saved ({savedKeys.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('excluded')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'excluded'
                      ? 'bg-slate-700 text-slate-100 shadow'
                      : 'bg-slate-900/80 text-slate-500 hover:text-slate-300 border border-slate-800'
                  }`}
                >
                  <FilterX className="w-3.5 h-3.5" />
                  <span>
                    Excluded ({recommendations ? recommendations.excluded.length : 0})
                  </span>
                </button>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Displaying</span>
                <strong className="text-slate-200 font-extrabold">{displayAreas.length}</strong>
                <span>micro-markets</span>
              </div>
            </div>

            {/* Results Grid / List */}
            {isLoading && !recommendations ? (
              <SkeletonList />
            ) : displayAreas.length === 0 ? (
              /* Designed Empty State */
              <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <FilterX className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-100 text-lg">
                    {activeTab === 'saved' ? 'No Saved Neighborhoods' : 'No Neighborhoods Match These Constraints'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    {activeTab === 'saved'
                      ? 'Bookmark micro-markets by clicking the bookmark icon on any card to compare or review them later.'
                      : 'Your current constraints excluded every micro-market in this city. Try relaxing your rent ceiling, widening your commute tolerance, or changing the transit mode.'}
                  </p>
                </div>

                {activeTab !== 'saved' && (
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Constraints</span>
                  </button>
                )}
              </div>
            ) : (
              /* Staggered Animated Area Cards */
              <motion.div layout className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {displayAreas.map((area, idx) => (
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
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Bottom Comparison Drawer (when items selected) */}
      <AnimatePresence>
        {comparedAreas.length > 0 && (
          <motion.aside
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            aria-label="Neighborhood Comparison Drawer"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] glass-panel border border-cyan-500/40 rounded-2xl p-3 shadow-2xl shadow-cyan-500/10 flex items-center justify-between gap-3 bg-slate-950/90 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 shrink-0 pl-1">
                <Scale className="w-4 h-4" />
                <span>Compare:</span>
              </span>
              {comparedAreas.map((area) => (
                <span
                  key={area.key}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shrink-0"
                >
                  <span>{area.name}</span>
                  <button
                    onClick={() => handleToggleCompare(area)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setComparedAreas([])}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Clear
              </button>
              <button
                onClick={() => setIsCompareOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
              >
                <span>Launch Compare</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">NestFit</span>
            <span>•</span>
            <span className="capitalize">{filters.city} Multi-Factor Location Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setShowDisclaimer(true)}
              className="hover:text-emerald-400 transition-colors"
            >
              Data Ethics & Safety Limitations
            </button>
            <span>•</span>
            <span>OSRM + Overpass API + CPCB CAAQMS</span>
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

