import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { CityAutocomplete } from '../components/CityAutocomplete';
import {
  Compass,
  ArrowRight,
  Sparkles,
  MapPin,
  ShieldAlert,
  Sun,
  Moon,
  ChevronRight,
  Scale
} from 'lucide-react';

const sectionMotionProps = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [selectedCity, setSelectedCity] = useState<string>('bangalore');

  const handleLaunchApp = (city?: string) => {
    const targetCity = city || selectedCity;
    navigate(`/app?city=${targetCity}`);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#E2E8F0] flex flex-col font-sans overflow-x-hidden selection:bg-[#0D9488]/30 selection:text-white antialiased">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#0B1120]/95 backdrop-blur-sm border-b border-[#1F2937]">
        <div className="max-w-[1720px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#141B2D] border border-[#1F2937] flex items-center justify-center text-[#0D9488]">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg tracking-tight text-[#E2E8F0]">
                NestFit
              </span>
              <span className="text-[11px] font-medium tracking-wide px-2 py-0.5 rounded bg-[#141B2D] text-[#94A3B8] border border-[#1F2937]">
                v2.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#94A3B8]">
            <a href="#how-it-works" className="hover:text-[#E2E8F0] transition-colors">How It Works</a>
            <a href="#pareto-vs-linear" className="hover:text-[#E2E8F0] transition-colors">Pareto vs. Linear</a>
            <a href="#cities" className="hover:text-[#E2E8F0] transition-colors">Supported Cities</a>
            <a href="#data-ethics" className="hover:text-[#E2E8F0] transition-colors">Data Ethics</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] bg-[#141B2D] border border-[#1F2937] transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D97706]" /> : <Moon className="w-4 h-4 text-[#94A3B8]" />}
            </button>

            {/* Differentiated secondary action: opens city select on landing page, leaving primary solid CTA for Hero */}
            <a
              href="#cities"
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#94A3B8] hover:text-[#E2E8F0] bg-[#141B2D] hover:bg-[#1A2332] border border-[#1F2937] transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Select City</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Tightened, Intentional Spacing) */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative pt-12 pb-12 sm:pt-16 sm:pb-16 border-b border-[#1F2937]"
      >
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#141B2D] border border-[#1F2937] text-[#94A3B8] text-xs font-medium mb-3 sm:mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Multi-Objective Non-Dominated Sorting (Deb O(MN²))</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#E2E8F0] leading-tight max-w-3xl mx-auto mb-2.5 sm:mb-3">
            Find where you fit in a city, not just where you rent.
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-2xl mx-auto mb-4 sm:mb-5">
            NestFit scores neighborhoods across live commute, rent benchmarks, air quality, 
            and healthcare density to return the mathematically non-dominated Pareto frontier — 
            no arbitrary linear weights, no outlier concealment.
          </p>

          {/* City Autocomplete Dropdown with Rotating Typewriter Placeholder */}
          <div className="w-full max-w-xl mx-auto mb-4 sm:mb-5">
            <CityAutocomplete
              currentCityId={selectedCity}
              onSelectCity={(key) => handleLaunchApp(key)}
              variant="hero"
            />
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleLaunchApp()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Launch {selectedCity === 'bangalore' ? 'Bangalore' : 'Pune'} Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-[#94A3B8] hover:text-[#E2E8F0] bg-[#141B2D] hover:bg-[#1A2332] border border-[#1F2937] transition-colors flex items-center justify-center gap-2"
            >
              <span>Methodology Overview</span>
            </a>
          </div>
        </div>
      </motion.section>

      {/* 3. Metric Strip (Dedicated Proof Section - Generous Padding, No Clipped Boundaries) */}
      <motion.section
        {...sectionMotionProps}
        className="py-10 sm:py-12 bg-[#0E1526] border-b border-[#1F2937]"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="p-4 sm:p-5 rounded-xl bg-[#141B2D] border border-[#1F2937] space-y-1">
              <div className="text-2xl sm:text-3xl font-semibold text-[#E2E8F0] font-mono">
                <AnimatedCounter value={36} suffix="+" />
              </div>
              <h4 className="text-xs font-medium text-[#94A3B8]">Micro-Markets</h4>
              <p className="text-[11px] text-[#64748B]">Bangalore & Pune spatial sectors</p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#141B2D] border border-[#1F2937] space-y-1">
              <div className="text-2xl sm:text-3xl font-semibold text-[#E2E8F0] font-mono">
                <AnimatedCounter value={13} suffix=" Hubs" />
              </div>
              <h4 className="text-xs font-medium text-[#94A3B8]">Major Tech Campuses</h4>
              <p className="text-[11px] text-[#64748B]">Ecospace, Manyata, Hinjawadi, ITPL</p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#141B2D] border border-[#1F2937] space-y-1">
              <div className="text-2xl sm:text-3xl font-semibold text-[#E2E8F0] font-mono">
                <AnimatedCounter value={5} suffix=" Factors" />
              </div>
              <h4 className="text-xs font-medium text-[#94A3B8]">Objective Criteria</h4>
              <p className="text-[11px] text-[#64748B]">Rent, Commute, AQI, Healthcare, Retail</p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#141B2D] border border-[#1F2937] space-y-1">
              <div className="text-2xl sm:text-3xl font-semibold text-[#E2E8F0] font-mono">
                0%
              </div>
              <h4 className="text-xs font-medium text-[#94A3B8]">Subjective Bias</h4>
              <p className="text-[11px] text-[#64748B]">Deb's Fast Non-Dominated Sort</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4. Interactive Preview Showcase Section */}
      <motion.section
        {...sectionMotionProps}
        className="py-16 sm:py-20 max-w-5xl mx-auto px-6 border-b border-[#1F2937]"
      >
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-12">
          <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
            Spatial Intelligence Preview
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#E2E8F0]">
            Multi-Objective Evaluation Interface
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Split-view workspace with Leaflet choropleth maps, live debounced slider constraints, 
            and normalized 5-dimension radar projections.
          </p>
        </div>

        {/* Mockup Preview Card */}
        <div className="p-6 rounded-xl bg-[#141B2D] border border-[#1F2937] shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30">
                <span>Front 1 • Optimal Preview</span>
              </div>
              <h3 className="text-xl font-semibold text-[#E2E8F0]">
                {selectedCity === 'bangalore' ? 'Indiranagar' : 'Baner (High Street)'}
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {selectedCity === 'bangalore'
                  ? 'Premier residential district with Namma Metro Purple Line corridor bonus, mature tree canopies, and rapid access to Bagmane Tech Park.'
                  : 'Vibrant urban center adjacent to Balewadi High Street with quick arterial road connection to Hinjawadi Infotech Park.'}
              </p>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-[#0B1120] border border-[#1F2937]">
                  <span className="text-[#64748B] text-[11px]">Benchmark Rent</span>
                  <strong className="text-sm font-semibold text-[#E2E8F0] font-mono block mt-0.5">
                    {selectedCity === 'bangalore' ? '₹25,000' : '₹20,000'}/mo
                  </strong>
                </div>

                <div className="p-3 rounded-lg bg-[#0B1120] border border-[#1F2937]">
                  <span className="text-[#64748B] text-[11px]">Peak Commute</span>
                  <strong className="text-sm font-semibold text-[#E2E8F0] font-mono block mt-0.5">
                    {selectedCity === 'bangalore' ? '18 mins' : '16 mins'}
                  </strong>
                </div>
              </div>

              <button
                onClick={() => handleLaunchApp()}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] transition-colors flex items-center gap-1.5"
              >
                <span>Open in Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-lg bg-[#0B1120] border border-[#1F2937]">
              <div className="w-full text-xs font-medium text-[#64748B] mb-2 flex items-center justify-between">
                <span>Normalized Criteria Radar</span>
                <span>Scale: 0 - 100</span>
              </div>
              <div className="relative w-full flex items-center justify-center py-2">
                <svg width="220" height="220" className="overflow-visible">
                  {[25, 50, 75].map((r) => (
                    <circle key={r} cx="110" cy="110" r={r} fill="none" stroke="#1F2937" strokeWidth="1" />
                  ))}
                  <polygon
                    points="110,38 174,75 165,158 60,149 46,84"
                    fill="#0D9488"
                    fillOpacity="0.18"
                    stroke="#0D9488"
                    strokeWidth="1.5"
                  />
                  <circle cx="110" cy="38" r="3" fill="#0D9488" />
                  <circle cx="174" cy="75" r="3" fill="#0D9488" />
                  <circle cx="165" cy="158" r="3" fill="#0D9488" />
                  <circle cx="60" cy="149" r="3" fill="#0D9488" />
                  <circle cx="46" cy="84" r="3" fill="#0D9488" />
                  <text x="110" y="22" textAnchor="middle" className="text-[10px] fill-[#94A3B8]">Affordability (82)</text>
                  <text x="190" y="78" textAnchor="start" className="text-[10px] fill-[#94A3B8]">Commute (90)</text>
                  <text x="175" y="172" textAnchor="start" className="text-[10px] fill-[#94A3B8]">Air Quality (78)</text>
                  <text x="45" y="165" textAnchor="end" className="text-[10px] fill-[#94A3B8]">Healthcare (94)</text>
                  <text x="35" y="85" textAnchor="end" className="text-[10px] fill-[#94A3B8]">Groceries (88)</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 5. "How It Works" Section */}
      <motion.section
        id="how-it-works"
        {...sectionMotionProps}
        className="py-16 sm:py-20 max-w-5xl mx-auto px-6 border-b border-[#1F2937]"
      >
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-12">
          <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
            Optimization Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#E2E8F0]">
            Three-Stage Pareto Matching
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Moving past simplistic 1-dimensional filters to multi-criteria dominance sorting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-[#141B2D] border border-[#1F2937] space-y-3">
            <div className="w-8 h-8 rounded-md bg-[#1A2332] border border-[#1F2937] flex items-center justify-center text-[#E2E8F0] font-mono text-sm font-semibold">
              1
            </div>
            <h3 className="text-base font-semibold text-[#E2E8F0]">Pin Destination Office</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Select your workplace campus. OSRM computes driving and transit duration with 
              peak-hour calibration and Metro corridor bonuses.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#141B2D] border border-[#1F2937] space-y-3">
            <div className="w-8 h-8 rounded-md bg-[#1A2332] border border-[#1F2937] flex items-center justify-center text-[#E2E8F0] font-mono text-sm font-semibold">
              2
            </div>
            <h3 className="text-base font-semibold text-[#E2E8F0]">Apply Hard Constraints</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Define your non-negotiables (rent ceiling, commute limit). Ineligible areas are 
              partitioned into the Excluded category with exact rationale.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#141B2D] border border-[#1F2937] space-y-3">
            <div className="w-8 h-8 rounded-md bg-[#1A2332] border border-[#1F2937] flex items-center justify-center text-[#E2E8F0] font-mono text-sm font-semibold">
              3
            </div>
            <h3 className="text-base font-semibold text-[#E2E8F0]">Non-Dominated Sorting</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Candidate A dominates B if A is superior in at least one factor and inferior in none. 
              Front 1 represents all mathematically irreplaceable trade-offs.
            </p>
          </div>
        </div>
      </motion.section>

      {/* 6. Pareto Frontier vs. Weighted Scoring Comparison */}
      <motion.section
        id="pareto-vs-linear"
        {...sectionMotionProps}
        className="py-16 sm:py-20 max-w-5xl mx-auto px-6 border-b border-[#1F2937]"
      >
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-12">
          <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
            Mathematical Foundations
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#E2E8F0]">
            Why Linear Weighted Sums Conceal Critical Trade-offs
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Standard real estate portals collapse complex multi-factor reality into one arbitrary number.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weighted Sum Column */}
          <div className="p-6 rounded-xl bg-[#141B2D] border border-[#1F2937] space-y-4">
            <div className="flex items-center gap-2 text-[#94A3B8] font-semibold text-xs uppercase tracking-wider">
              <Scale className="w-4 h-4 text-[#64748B]" />
              <span>Linear Weighted Composite</span>
            </div>
            <h3 className="text-base font-medium text-[#E2E8F0]">Score = w₁·Rent + w₂·Commute + ...</h3>
            <ul className="space-y-2.5 text-xs text-[#94A3B8] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#64748B] font-mono font-bold">•</span>
                <span><strong>Outlier Concealment:</strong> A 90-minute commute can rank #1 if rent is marginally cheaper.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#64748B] font-mono font-bold">•</span>
                <span><strong>Weight Guesswork:</strong> Users must assign arbitrary percentages that unpredictably reshuffle rankings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#64748B] font-mono font-bold">•</span>
                <span><strong>Loss of Compromises:</strong> Inability to detect balanced non-convex compromise solutions.</span>
              </li>
            </ul>
          </div>

          {/* Pareto Frontier Column */}
          <div className="p-6 rounded-xl bg-[#141B2D] border border-[#0D9488]/40 space-y-4 shadow-card">
            <div className="flex items-center gap-2 text-[#0D9488] font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>NestFit Pareto Frontier</span>
            </div>
            <h3 className="text-base font-medium text-[#E2E8F0]">Non-Dominated Sorting Architecture</h3>
            <ul className="space-y-2.5 text-xs text-[#E2E8F0] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#0D9488] font-mono font-bold">✓</span>
                <span><strong>Zero Arbitrary Weights:</strong> Solves for the true Pareto frontier where each option is an irreplaceable optimum.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0D9488] font-mono font-bold">✓</span>
                <span><strong>Preserves Diverse Lifestyles:</strong> Returns both the lowest-rent and shortest-commute alternatives simultaneously.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0D9488] font-mono font-bold">✓</span>
                <span><strong>Crowding Distance Diversity:</strong> Prevents clustering and presents a comprehensive lifestyle spectrum.</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* 7. Multi-City Showcase Section */}
      <motion.section
        id="cities"
        {...sectionMotionProps}
        className="py-16 sm:py-20 max-w-5xl mx-auto px-6 border-b border-[#1F2937]"
      >
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-12">
          <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
            Supported Metros
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#E2E8F0]">
            Pre-Warmed Datasets Available Today
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Pre-warmed with spatial boundary polygons, OSRM graphs, and CPCB CAAQMS air stations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bangalore Card */}
          <div className="p-6 rounded-xl bg-[#141B2D] border border-[#1F2937] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#0D9488] uppercase tracking-wider">Karnataka</span>
                <h3 className="text-xl font-semibold text-[#E2E8F0] mt-0.5">Bangalore</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#1A2332] text-[#94A3B8] text-xs font-mono border border-[#1F2937]">
                20 Micro-Markets
              </span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">
              From Indiranagar and Koramangala to Whitefield and Bellandur ORR. Mapped against RMZ Ecospace, 
              Manyata Embassy Park, ITPL, Electronic City, and Namma Metro Purple & Green corridors.
            </p>

            <button
              onClick={() => handleLaunchApp('bangalore')}
              className="w-full py-2.5 rounded-lg text-xs font-medium text-[#E2E8F0] hover:text-white bg-[#1A2332] hover:bg-[#253043] border border-[#1F2937] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Bangalore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pune Card */}
          <div className="p-6 rounded-xl bg-[#141B2D] border border-[#1F2937] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">Maharashtra</span>
                <h3 className="text-xl font-semibold text-[#E2E8F0] mt-0.5">Pune</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#1A2332] text-[#94A3B8] text-xs font-mono border border-[#1F2937]">
                16 Micro-Markets
              </span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">
              From Hinjawadi Phase 1-3, Wakad, and Baner to Kharadi EON Free Zone, Viman Nagar, and Magarpatta Cybercity. 
              Calibrated against Pune Metro and CPCB ambient air stations.
            </p>

            <button
              onClick={() => handleLaunchApp('pune')}
              className="w-full py-2.5 rounded-lg text-xs font-medium text-[#E2E8F0] hover:text-white bg-[#1A2332] hover:bg-[#253043] border border-[#1F2937] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Pune</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.section>

      {/* 8. Data Ethics & Transparent Limitations Section */}
      <motion.section
        id="data-ethics"
        {...sectionMotionProps}
        className="py-16 sm:py-20 max-w-5xl mx-auto px-6 border-b border-[#1F2937]"
      >
        <div className="p-6 sm:p-8 rounded-xl bg-[#141B2D] border border-amber-900/30 space-y-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1A2332] border border-[#1F2937] flex items-center justify-center text-[#D97706]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#E2E8F0]">Data Ethics & Factor Transparency</h2>
              <p className="text-xs text-[#64748B]">Explicit exclusion of crime/safety proxy metrics</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#94A3B8] leading-relaxed">
            <p>
              In accordance with data ethics guidelines, NestFit <strong>strictly refuses to synthesize arbitrary safety scores</strong>. 
              No standardized, verified, ward-level public crime dataset is published for Indian cities. 
              Synthesizing unverified proxy figures produces misleading demographic and commercial discrimination.
            </p>
            <p>
              Every scored factor is anchored in verified ground truth:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#64748B] pl-1 font-mono text-[11px]">
              <li>Road Commute: OSRM engine with peak hour traffic multipliers</li>
              <li>Amenities: OpenStreetMap Overpass POI queries</li>
              <li>Air Quality: CPCB CAAQMS ambient network + OpenWeatherMap Air API</li>
              <li>Rental Benchmarks: 2024–2025 verified micro-market surveys</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* 9. Footer */}
      <footer className="mt-auto border-t border-[#1F2937] bg-[#0B1120] py-6 text-xs text-[#64748B]">
        <div className="max-w-[1720px] mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#94A3B8]">NestFit</span>
            <span>•</span>
            <span>Location Intelligence Engine (Bangalore & Pune)</span>
          </div>
          <div className="flex items-center gap-4 text-[#64748B]">
            <a href="/api-docs" target="_blank" rel="noopener noreferrer" className="hover:text-[#94A3B8] transition-colors">
              OpenAPI Swagger
            </a>
            <span>•</span>
            <span>OpenStreetMap + OSRM + CPCB</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
