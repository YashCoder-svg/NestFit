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
  Clock,
  IndianRupee,
  Wind,
  Hospital,
  ShoppingBag,
  ShieldAlert,
  Layers,
  Building2,
  CheckCircle2,
  Sun,
  Moon,
  ChevronRight,
  TrendingDown,
  Scale
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [selectedCity, setSelectedCity] = useState<string>('bangalore');

  const handleLaunchApp = (city?: string) => {
    const targetCity = city || selectedCity;
    navigate(`/app?city=${targetCity}`);
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Compass className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  NestFit
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Multi-City v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Personal Location-Intelligence Engine</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#cities" className="hover:text-emerald-400 transition-colors">Cities</a>
            <a href="#pareto-vs-linear" className="hover:text-emerald-400 transition-colors">Pareto vs. Linear</a>
            <a href="#data-ethics" className="hover:text-emerald-400 transition-colors">Data Ethics</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={() => handleLaunchApp()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Launch Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Animated Gradient & Particle Glow */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden border-b border-slate-800/60">
        {/* Ambient Animated Glow Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-72 bg-gradient-to-tr from-emerald-500/15 via-teal-500/15 to-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Objective Non-Dominated Sorting (Deb's Algorithm)</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Stop guessing where to live in{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                India's Tech Capitals.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              NestFit scores neighborhoods across <strong>live commute</strong>, <strong>rent benchmarks</strong>, 
              <strong> air quality</strong>, and <strong>healthcare access</strong> to return the mathematically 
              unbeatable <strong>Pareto-optimal set</strong> — no arbitrary weights, no house-hunting fatigue.
            </p>

            {/* City Autocomplete & Demo Cities */}
            <div className="pt-2 max-w-xl mx-auto">
              <CityAutocomplete
                currentCityId={selectedCity}
                onSelectCity={(key) => handleLaunchApp(key)}
                variant="hero"
              />
            </div>


            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleLaunchApp()}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-xl shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Launch {selectedCity === 'bangalore' ? 'Bangalore' : 'Pune'} Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl text-sm font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-900 border border-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <span>How Pareto Frontier Works</span>
              </a>
            </div>
          </motion.div>

          {/* Metric Highlight Counter Strip */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 text-left space-y-1">
              <div className="text-3xl font-extrabold text-emerald-400">
                <AnimatedCounter value={36} suffix="+" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">Micro-Markets</h4>
              <p className="text-[11px] text-slate-400">Bangalore & Pune verified polygons</p>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-slate-800 text-left space-y-1">
              <div className="text-3xl font-extrabold text-cyan-400">
                <AnimatedCounter value={13} suffix=" Hubs" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">Major Tech Parks</h4>
              <p className="text-[11px] text-slate-400">Manyata, Ecospace, Hinjawadi, EON</p>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-slate-800 text-left space-y-1">
              <div className="text-3xl font-extrabold text-teal-400">
                <AnimatedCounter value={5} suffix=" Objectives" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">Multi-Factor Analysis</h4>
              <p className="text-[11px] text-slate-400">Rent, Commute, AQI, Healthcare, Retail</p>
            </div>

            <div className="p-6 rounded-3xl glass-panel border border-slate-800 text-left space-y-1">
              <div className="text-3xl font-extrabold text-purple-400">
                100%
              </div>
              <h4 className="text-xs font-bold text-slate-200">Zero Biased Weights</h4>
              <p className="text-[11px] text-slate-400">Mathematically non-dominated frontier</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Preview Showcase Section */}
      <section className="py-24 sm:py-28 max-w-7xl mx-auto px-6 lg:px-8 border-b border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Visual Location Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Designed like a funded startup’s command center.
          </h2>
          <p className="text-sm text-slate-400">
            Split-view workspace with real Leaflet choropleth maps, live debounced slider pre-filters, 
            animated card transitions, and factor radar breakdowns.
          </p>
        </div>

        {/* Mockup Preview Card */}
        <div className="p-3 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-800/50 to-slate-950 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 sm:p-8 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                ★ Front 1 • Pareto Optimal Preview
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                {selectedCity === 'bangalore' ? 'Indiranagar' : 'Baner (High Street)'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedCity === 'bangalore'
                  ? 'Premier residential oasis with tree canopies, direct Purple Line Metro, boutique cafes, and rapid commute to Bagmane Tech Park.'
                  : 'Vibrant urban center adjacent to Balewadi High Street with mountain views, dynamic dining, and fast access to Hinjawadi Infotech Park.'}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Est. 1BHK Rent</span>
                  </div>
                  <strong className="text-base text-slate-100 mt-1 block">
                    {selectedCity === 'bangalore' ? '₹25,000' : '₹20,000'}/mo
                  </strong>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Travel Time</span>
                  </div>
                  <strong className="text-base text-slate-100 mt-1 block">
                    {selectedCity === 'bangalore' ? '18 mins' : '16 mins'}
                  </strong>
                </div>
              </div>

              <button
                onClick={() => handleLaunchApp()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <span>Explore on Interactive Map</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-full text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                <span>Multi-Objective Suitability Radar</span>
                <span className="text-emerald-400">Score Range: 0 - 100</span>
              </div>
              <div className="relative w-full flex items-center justify-center py-4">
                <svg width="240" height="240" className="overflow-visible">
                  {[30, 60, 90].map(r => (
                    <circle key={r} cx="120" cy="120" r={r} fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="3,3" />
                  ))}
                  <polygon
                    points="120,40 190,80 180,170 65,160 50,90"
                    fill="#10b981"
                    fillOpacity="0.35"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                  <circle cx="120" cy="40" r="4" fill="#10b981" />
                  <circle cx="190" cy="80" r="4" fill="#10b981" />
                  <circle cx="180" cy="170" r="4" fill="#10b981" />
                  <circle cx="65" cy="160" r="4" fill="#10b981" />
                  <circle cx="50" cy="90" r="4" fill="#10b981" />
                  <text x="120" y="24" textAnchor="middle" className="text-[10px] font-bold fill-slate-300">Affordability (82)</text>
                  <text x="210" y="85" textAnchor="start" className="text-[10px] font-bold fill-slate-300">Commute (90)</text>
                  <text x="195" y="185" textAnchor="start" className="text-[10px] font-bold fill-slate-300">Air Quality (78)</text>
                  <text x="45" y="180" textAnchor="end" className="text-[10px] font-bold fill-slate-300">Healthcare (94)</text>
                  <text x="35" y="90" textAnchor="end" className="text-[10px] font-bold fill-slate-300">Groceries (88)</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "How It Works" Section (Explaining Pareto Frontier in Plain English) */}
      <section id="how-it-works" className="py-24 sm:py-28 max-w-7xl mx-auto px-6 lg:px-8 border-b border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Mathematical Foundation
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How the Pareto Frontier Solves Location Search
          </h2>
          <p className="text-sm text-slate-400">
            In urban living, there is no single magical answer. Low rent almost always means longer commutes; 
            prime hubs have higher rent but superior amenities. Here is how NestFit navigates the trade-offs:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
              1
            </div>
            <h3 className="text-lg font-extrabold text-white">Input Your Workplace</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Select your company tech park or custom coordinate. The Open Source Routing Machine (OSRM) 
              computes real road duration and distance, calibrated for peak Indian traffic and Metro lines.
            </p>
          </div>

          <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg">
              2
            </div>
            <h3 className="text-lg font-extrabold text-white">Live Hard Constraints</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Set your maximum budget (e.g. max ₹25,000) or commute threshold. Areas that violate your constraints 
              are immediately filtered into the <em>Excluded</em> list with exact explanation reasons.
            </p>
          </div>

          <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold text-lg">
              3
            </div>
            <h3 className="text-lg font-extrabold text-white">Non-Dominated Sorting</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Candidate $A$ dominates candidate $B$ if and only if $A$ is better or equal in every factor. 
              <strong> Front 1</strong> is the true Pareto Frontier — the set of areas where no other neighborhood is strictly superior.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Pareto Frontier vs. Weighted Scoring Comparison */}
      <section id="pareto-vs-linear" className="py-24 sm:py-28 max-w-7xl mx-auto px-6 lg:px-8 border-b border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            The Fundamental Dilemma
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Why Single Weighted Scores Fail You
          </h2>
          <p className="text-sm text-slate-400">
            Real estate aggregators collapse multi-dimensional reality into one arbitrary score. Here is why NestFit rejects that model:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Weighted Sum Column */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Traditional Weighted Scoring</span>
            </div>
            <h3 className="text-xl font-bold text-white">Score = 0.4*Rent + 0.3*Commute + ...</h3>
            <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Conceals Outliers:</strong> An area with an unbearable 90-minute commute can rank #1 just because rent is ₹6,000 cheaper.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Arbitrary Weights:</strong> Users are forced to guess numerical weights (35% vs 40%), and minor slider changes unpredictably shuffle results.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Hides Compromises:</strong> Misses balanced non-convex compromise solutions.</span>
              </li>
            </ul>
          </div>

          {/* Pareto Frontier Column */}
          <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 shadow-xl shadow-emerald-500/5">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>NestFit Pareto Frontier</span>
            </div>
            <h3 className="text-xl font-bold text-white">Non-Dominated Optimal Frontier</h3>
            <ul className="space-y-3 text-xs text-slate-200 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Zero Fabricated Weights:</strong> Solves for the mathematical trade-off curve where every candidate represents an irreplaceable optimum.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Preserves True Options:</strong> Highlights both the lowest-rent option and the shortest-commute option without bias.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Crowding Distance Diversity:</strong> Prevents clustering by ensuring a balanced spread across budget and commute profiles.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Multi-City Showcase Section */}
      <section id="cities" className="py-24 sm:py-28 max-w-7xl mx-auto px-6 lg:px-8 border-b border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Supported Tech Metros
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Available at Launch in Bangalore & Pune
          </h2>
          <p className="text-sm text-slate-400">
            Engineered with a city-agnostic schema ready for Pan-India location intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bangalore Card */}
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Silicon Valley of India</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">Bangalore</h3>
                <p className="text-xs text-slate-400">Karnataka, India</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                20 Micro-Markets
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              From Koramangala and Indiranagar to Whitefield and Bellandur ORR. Mapped against Manyata Embassy Park, 
              ITPL, RMZ Ecospace, Electronic City, and Namma Metro Purple & Green lines.
            </p>

            <button
              onClick={() => handleLaunchApp('bangalore')}
              className="w-full py-3 rounded-2xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
            >
              <span>Explore Bangalore Micro-Markets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pune Card */}
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">Oxford of the East</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">Pune</h3>
                <p className="text-xs text-slate-400">Maharashtra, India</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                16 Micro-Markets
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              From Hinjawadi Phase 1-3, Baner, and Wakad to Kharadi EON Free Zone, Viman Nagar, and Magarpatta Cybercity. 
              Mapped against Pune Metro Line 1 & 2 and CPCB ambient air monitors.
            </p>

            <button
              onClick={() => handleLaunchApp('pune')}
              className="w-full py-3 rounded-2xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
            >
              <span>Explore Pune Micro-Markets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Data Ethics & Transparent Limitations Section */}
      <section id="data-ethics" className="py-24 sm:py-28 max-w-7xl mx-auto px-6 lg:px-8 border-b border-slate-800/60">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">Data Ethics & Factor Transparency</h2>
              <p className="text-xs text-slate-400">Why crime/safety data is strictly excluded</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              In accordance with ethical AI guidelines, NestFit <strong>strictly refuses to synthesize or fabricate safety scores</strong>. 
              No standardized, verified, and granular public spatial crime dataset is published at the neighborhood/ward level for Bangalore or Pune. 
              Synthesizing arbitrary proxy scores (e.g. from streetlight counts or commercial sentiment) creates harmful demographic and economic discrimination.
            </p>
            <p>
              Every scored factor is anchored in verified public data pipelines:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs pl-2">
              <li><strong>Road Commute:</strong> Open Source Routing Machine (OSRM) with peak traffic heuristics</li>
              <li><strong>Healthcare & Groceries:</strong> OpenStreetMap Overpass live queries</li>
              <li><strong>Air Quality:</strong> CPCB Continuous Ambient Stations + OpenWeatherMap Air API</li>
              <li><strong>Rental Rates:</strong> 2024–2025 Market Survey Indices (clearly labeled as estimated)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Final CTA Section */}
      <section className="py-24 text-center max-w-4xl mx-auto px-6">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to find your ideal neighborhood?
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Try the live interactive engine now with real-time OSRM commute routing, Leaflet choropleth maps, and Pareto frontier optimization.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4">
            <button
              onClick={() => handleLaunchApp()}
              className="px-8 py-4 rounded-2xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Launch Location Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">NestFit</span>
            <span>•</span>
            <span>Personal Location-Intelligence Engine (Bangalore & Pune)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="/api-docs" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
              Swagger API Docs
            </a>
            <span>•</span>
            <span>OpenStreetMap + OSRM + CPCB</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
