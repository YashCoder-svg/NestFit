export interface RawNeighborhoodData {
  city: 'bangalore' | 'pune';
  key: string;
  name: string;
  zone: string;
  description: string;
  centroid: [number, number]; // [longitude, latitude]
  polygon: [number, number][]; // [[lon, lat], ...]
  benchmarkRent1BHK: number;
  benchmarkRent2BHK: number;
  aqiBaseline: number;
  hospitalCount: number;
  groceryCount: number;
  metroConnected: boolean;
  transitScore: number;
  tags: string[];
}

export interface RawWorkplaceData {
  city: 'bangalore' | 'pune';
  key: string;
  name: string;
  zone: string;
  centroid: [number, number]; // [lon, lat]
  description: string;
  tags: string[];
}

export interface CityMetadata {
  id: 'bangalore' | 'pune';
  name: string;
  state: string;
  center: [number, number]; // [lat, lon] for Leaflet
  defaultZoom: number;
  description: string;
  metroLines: string[];
  aqiStationsCount: number;
}

export const CITIES_METADATA: Record<string, CityMetadata> = {
  bangalore: {
    id: 'bangalore',
    name: 'Bangalore',
    state: 'Karnataka',
    center: [12.9716, 77.5946],
    defaultZoom: 11,
    description: 'India\'s Silicon Valley — tech parks along the Outer Ring Road, vibrant cafe culture, and rapid metro expansion.',
    metroLines: ['Purple Line', 'Green Line', 'Yellow Line (Upcoming)'],
    aqiStationsCount: 9
  },
  pune: {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    center: [18.5204, 73.8567],
    defaultZoom: 11,
    description: 'The Oxford of the East & major automotive/IT capital — Hinjawadi infotech cluster, Kharadi IT SEZs, and lush Sahyadri foothills.',
    metroLines: ['Line 1 (Purple - PCMC to Swargate)', 'Line 2 (Aqua - Vanaz to Ramwadi)', 'Line 3 (Hinjawadi to Shivajinagar)'],
    aqiStationsCount: 7
  }
};

// ==================== WORKPLACES ====================

export const ALL_WORKPLACES: RawWorkplaceData[] = [
  // --- Bangalore Workplaces ---
  {
    city: 'bangalore',
    key: 'ecospace_bellandur',
    name: 'RMZ Ecospace / Ecoworld (ORR)',
    zone: 'Outer Ring Road (East)',
    centroid: [77.6848, 12.9279],
    description: 'Bellandur Outer Ring Road tech corridor. Intel, Honeywell, Shell, Morgan Stanley, Cisco.',
    tags: ['ORR Tech Hub', 'Bellandur', 'High Congestion Corridor']
  },
  {
    city: 'bangalore',
    key: 'manyata_tech_park',
    name: 'Manyata Embassy Business Park',
    zone: 'Thanisandra / Nagavara (North)',
    centroid: [77.6212, 13.0489],
    description: 'North Bangalore mega-park on Outer Ring Road. Cognizant, IBM, Philips, Nokia, Target.',
    tags: ['North Tech Hub', 'Airport Highway Proximity', 'Lake Facing']
  },
  {
    city: 'bangalore',
    key: 'itpl_whitefield',
    name: 'ITPL / International Tech Park',
    zone: 'Whitefield (East)',
    centroid: [77.7370, 12.9863],
    description: 'Pioneering IT enclave in Whitefield with direct Purple Line Metro terminal access.',
    tags: ['Purple Line Metro', 'Whitefield Cluster', 'TCS & Mercedes']
  },
  {
    city: 'bangalore',
    key: 'electronic_city_phase1',
    name: 'Electronic City Phase 1',
    zone: 'Electronic City (South)',
    centroid: [77.6602, 12.8452],
    description: 'Infosys & Wipro world headquarters, Siemens, Tech Mahindra, Yellow Line Metro.',
    tags: ['Elevated Expressway', 'Infosys HQ', 'Yellow Line Metro']
  },
  {
    city: 'bangalore',
    key: 'bagmane_tech_park',
    name: 'Bagmane Tech Park (CV Raman Nagar)',
    zone: 'East-Central (Near Indiranagar)',
    centroid: [77.6580, 12.9806],
    description: 'Scenic tech park nestled near Byrasandra Lake. Google, Boeing, Oracle, Dell.',
    tags: ['Lake Enclave', 'Indiranagar Adjacent', 'Google & Boeing']
  },
  {
    city: 'bangalore',
    key: 'embassy_golf_links',
    name: 'Embassy Golf Links (EGL)',
    zone: 'Central-East (Domlur / Koramangala)',
    centroid: [77.6430, 12.9515],
    description: 'Elite corporate park adjacent to KGA Golf Course. Goldman Sachs, IBM, Fidelity.',
    tags: ['Golf Course Facing', 'Koramangala Proximity', 'Goldman Sachs']
  },
  {
    city: 'bangalore',
    key: 'world_trade_center',
    name: 'World Trade Center / Brigade Gateway',
    zone: 'West (Malleshwaram / Rajajinagar)',
    centroid: [77.5552, 13.0118],
    description: 'West Bangalore business hub featuring Orion Mall, Columbia Asia, and Green Line Metro.',
    tags: ['Green Line Metro', 'World Trade Center', 'Orion Mall Complex']
  },

  // --- Pune Workplaces ---
  {
    city: 'pune',
    key: 'hinjawadi_rgip',
    name: 'Rajiv Gandhi Infotech Park (Hinjawadi)',
    zone: 'West (Hinjawadi)',
    centroid: [73.7179, 18.5913],
    description: 'Pune\'s premier IT cluster hosting 400+ tech enterprises: Infosys, Wipro, TCS, Cognizant, Tech Mahindra.',
    tags: ['Hinjawadi Mega Cluster', 'IT Special Economic Zone', 'Phase 1 & 2']
  },
  {
    city: 'pune',
    key: 'eon_free_zone_kharadi',
    name: 'EON Free Zone / WTC (Kharadi)',
    zone: 'East (Kharadi)',
    centroid: [73.9515, 18.5516],
    description: 'East Pune\'s tech nerve center. Barclays, Credit Suisse, UBS, Veritas, Sears, Zensar Technologies.',
    tags: ['East IT Epicenter', 'World Trade Center Pune', 'Banking & Fintech']
  },
  {
    city: 'pune',
    key: 'magarpatta_cybercity',
    name: 'Magarpatta Cybercity (Hadapsar)',
    zone: 'East-Central (Magarpatta)',
    centroid: [73.9298, 18.5147],
    description: 'Iconic self-contained cybercity township. Accenture, Amdocs, BNY Mellon, HCL, Red Hat.',
    tags: ['Cybercity Township', 'Walk to Work', 'Amdocs & Accenture']
  },
  {
    city: 'pune',
    key: 'cerebrum_kalyani_nagar',
    name: 'Cerebrum IT Park (Kalyani Nagar)',
    zone: 'Central-East (Kalyani Nagar)',
    centroid: [73.9056, 18.5489],
    description: 'Boutique tech hub situated near Koregaon Park bridge. Capgemini, HSBC Global Services.',
    tags: ['Kalyani Nagar', 'Nightlife Proximity', 'Capgemini & HSBC']
  },
  {
    city: 'pune',
    key: 'commerzone_yerwada',
    name: 'Commerzone IT Park (Yerwada)',
    zone: 'North-East (Yerwada)',
    centroid: [73.8833, 18.5552],
    description: 'Prime business campus near Pune Airport. HSBC Software, IBM, Nvidia, Bajaj Finserv.',
    tags: ['Airport Highway', 'Yerwada Business Hub', 'IBM & Nvidia']
  },
  {
    city: 'pune',
    key: 'icc_towers_sb_road',
    name: 'International Convention Centre (SB Road)',
    zone: 'Central-West (Senapati Bapat Road)',
    centroid: [73.8315, 18.5308],
    description: 'Prestigious corporate towers on Senapati Bapat Road. Cognizant, Persistent Systems, Deutsche Bank.',
    tags: ['Central Pune', 'JW Marriott Adjacent', 'Persistent & Cognizant']
  }
];

// ==================== NEIGHBORHOODS ====================

export const ALL_NEIGHBORHOODS: RawNeighborhoodData[] = [
  // ----------------------------------------------------
  // BANGALORE (20 Micro-Markets)
  // ----------------------------------------------------
  {
    city: 'bangalore',
    key: 'koramangala',
    name: 'Koramangala',
    zone: 'South-East',
    description: 'Bangalore\'s premier startup and dining hub. Vibrant nightlife, dense cafe culture, but higher rents and busy interior roads.',
    centroid: [77.6245, 12.9352],
    polygon: [
      [77.610, 12.925], [77.640, 12.925], [77.645, 12.945], [77.615, 12.948], [77.610, 12.925]
    ],
    benchmarkRent1BHK: 22000,
    benchmarkRent2BHK: 38000,
    aqiBaseline: 98,
    hospitalCount: 14,
    groceryCount: 32,
    metroConnected: false,
    transitScore: 78,
    tags: ['Startup Hub', 'Nightlife', 'Walkable Cafes', 'High Dining Density']
  },
  {
    city: 'bangalore',
    key: 'indiranagar',
    name: 'Indiranagar',
    zone: 'East',
    description: 'Upscale residential and commercial paradise. 100ft Road shopping, tree-lined avenues, direct Purple Line Metro connectivity.',
    centroid: [77.6408, 12.9784],
    polygon: [
      [77.630, 12.965], [77.655, 12.965], [77.655, 12.990], [77.625, 12.990], [77.630, 12.965]
    ],
    benchmarkRent1BHK: 25000,
    benchmarkRent2BHK: 44000,
    aqiBaseline: 88,
    hospitalCount: 12,
    groceryCount: 28,
    metroConnected: true,
    transitScore: 92,
    tags: ['Purple Line Metro', 'Boutique Cafes', 'Upscale', 'Green Canopy']
  },
  {
    city: 'bangalore',
    key: 'hsr_layout',
    name: 'HSR Layout',
    zone: 'South-East',
    description: 'Modern planned residential layout favoured by founders and techies. Wide sectors, parks, emerging startup epicenter.',
    centroid: [77.6446, 12.9121],
    polygon: [
      [77.630, 12.900], [77.660, 12.900], [77.662, 12.925], [77.632, 12.925], [77.630, 12.900]
    ],
    benchmarkRent1BHK: 20000,
    benchmarkRent2BHK: 35000,
    aqiBaseline: 92,
    hospitalCount: 11,
    groceryCount: 29,
    metroConnected: false,
    transitScore: 75,
    tags: ['Planned Layout', 'Startup Culture', 'Parks', 'Food Streets']
  },
  {
    city: 'bangalore',
    key: 'bellandur',
    name: 'Bellandur (Outer Ring Road)',
    zone: 'East',
    description: 'The epicenter of Bangalore tech parks (Ecospace, RMZ Ecoworld, Prestige Tech Park). Zero commute for ORR workers, but heavy traffic bottlenecks.',
    centroid: [77.6748, 12.9279],
    polygon: [
      [77.660, 12.915], [77.695, 12.915], [77.695, 12.942], [77.660, 12.942], [77.660, 12.915]
    ],
    benchmarkRent1BHK: 19000,
    benchmarkRent2BHK: 33000,
    aqiBaseline: 115,
    hospitalCount: 8,
    groceryCount: 22,
    metroConnected: false,
    transitScore: 68,
    tags: ['Tech Park Epicenter', 'Walk to Ecospace', 'Gated Communities']
  },
  {
    city: 'bangalore',
    key: 'whitefield',
    name: 'Whitefield / ITPL',
    zone: 'East',
    description: 'Massive IT cluster with sprawling gated societies, major international schools, malls, and newly extended Purple Line Metro.',
    centroid: [77.7499, 12.9698],
    polygon: [
      [77.720, 12.950], [77.775, 12.950], [77.775, 12.995], [77.720, 12.995], [77.720, 12.950]
    ],
    benchmarkRent1BHK: 16000,
    benchmarkRent2BHK: 28000,
    aqiBaseline: 82,
    hospitalCount: 16,
    groceryCount: 35,
    metroConnected: true,
    transitScore: 85,
    tags: ['ITPL', 'Purple Line Metro', 'Luxury Gated Communities', 'Family Friendly']
  },
  {
    city: 'bangalore',
    key: 'marathahalli',
    name: 'Marathahalli',
    zone: 'East',
    description: 'Affordable bridge between Old Airport Road and Outer Ring Road. Budget housing, high density of PG accommodations and shopping outlets.',
    centroid: [77.6974, 12.9591],
    polygon: [
      [77.685, 12.945], [77.715, 12.945], [77.715, 12.975], [77.685, 12.975], [77.685, 12.945]
    ],
    benchmarkRent1BHK: 14000,
    benchmarkRent2BHK: 24000,
    aqiBaseline: 118,
    hospitalCount: 9,
    groceryCount: 26,
    metroConnected: false,
    transitScore: 72,
    tags: ['Affordable Living', 'PG Epicenter', 'High Transit Buses', 'ORR Bridge']
  },
  {
    city: 'bangalore',
    key: 'electronic_city_phase1',
    name: 'Electronic City Phase 1',
    zone: 'South',
    description: 'Southern tech powerhouse home to Infosys, Wipro, and TCS. Elevated expressway access, organized campus vibe, very pocket-friendly.',
    centroid: [77.6602, 12.8452],
    polygon: [
      [77.640, 12.830], [77.680, 12.830], [77.680, 12.860], [77.640, 12.860], [77.640, 12.830]
    ],
    benchmarkRent1BHK: 11000,
    benchmarkRent2BHK: 19000,
    aqiBaseline: 74,
    hospitalCount: 7,
    groceryCount: 18,
    metroConnected: true,
    transitScore: 80,
    tags: ['Infosys & Wipro HQ', 'Elevated Expressway', 'Budget Friendly', 'Yellow Line Metro']
  },
  {
    city: 'bangalore',
    key: 'electronic_city_phase2',
    name: 'Electronic City Phase 2',
    zone: 'South',
    description: 'Quiet, affordable residential pockets east of Hosur Road with newer mid-rise apartment communities and tech campuses.',
    centroid: [77.6845, 12.8398],
    polygon: [
      [77.670, 12.825], [77.705, 12.825], [77.705, 12.855], [77.670, 12.855], [77.670, 12.825]
    ],
    benchmarkRent1BHK: 9500,
    benchmarkRent2BHK: 16500,
    aqiBaseline: 68,
    hospitalCount: 5,
    groceryCount: 14,
    metroConnected: false,
    transitScore: 65,
    tags: ['Quiet Neighborhood', 'Affordable 2BHK', 'Gated Communities']
  },
  {
    city: 'bangalore',
    key: 'btm_layout',
    name: 'BTM Layout',
    zone: 'South',
    description: 'Vibrant, high-density residential locality bridging Bannerghatta Road and Koramangala. Renowned for coaching centers, food stalls, and BTM Lake.',
    centroid: [77.6101, 12.9166],
    polygon: [
      [77.595, 12.905], [77.625, 12.905], [77.625, 12.930], [77.595, 12.930], [77.595, 12.905]
    ],
    benchmarkRent1BHK: 15000,
    benchmarkRent2BHK: 26000,
    aqiBaseline: 102,
    hospitalCount: 13,
    groceryCount: 31,
    metroConnected: true,
    transitScore: 86,
    tags: ['BTM Lake', 'Student & Young Tech', 'Bustling Food Scene', 'Yellow Line Metro']
  },
  {
    city: 'bangalore',
    key: 'jayanagar',
    name: 'Jayanagar',
    zone: 'South',
    description: 'Historic, master-planned residential garden city quadrant. Massive parks, iconic South Indian breakfast spots, Green Line Metro, high quality of life.',
    centroid: [77.5838, 12.9308],
    polygon: [
      [77.565, 12.915], [77.600, 12.915], [77.600, 12.945], [77.565, 12.945], [77.565, 12.915]
    ],
    benchmarkRent1BHK: 17000,
    benchmarkRent2BHK: 30000,
    aqiBaseline: 62,
    hospitalCount: 22,
    groceryCount: 34,
    metroConnected: true,
    transitScore: 94,
    tags: ['Green Line Metro', 'Heritage Bangalore', 'Massive Tree Canopy', 'High Healthcare Access']
  },
  {
    city: 'bangalore',
    key: 'jp_nagar',
    name: 'JP Nagar',
    zone: 'South',
    description: 'Established residential suburb with thriving cultural spaces (Ranga Shankara theater), lakes, microbreweries, and Green Line Metro connectivity.',
    centroid: [77.5857, 12.9063],
    polygon: [
      [77.570, 12.890], [77.605, 12.890], [77.605, 12.920], [77.570, 12.920], [77.570, 12.890]
    ],
    benchmarkRent1BHK: 15500,
    benchmarkRent2BHK: 27000,
    aqiBaseline: 68,
    hospitalCount: 15,
    groceryCount: 27,
    metroConnected: true,
    transitScore: 88,
    tags: ['Ranga Shankara', 'Microbreweries', 'Green Line Metro', 'Quiet Residential']
  },
  {
    city: 'bangalore',
    key: 'banashankari',
    name: 'Banashankari',
    zone: 'South-West',
    description: 'Bangalore\'s largest residential locality. Peaceful temples, traditional markets, Green Line Metro terminal, extremely family-friendly.',
    centroid: [77.5468, 12.9255],
    polygon: [
      [77.525, 12.905], [77.565, 12.905], [77.565, 12.945], [77.525, 12.945], [77.525, 12.905]
    ],
    benchmarkRent1BHK: 13000,
    benchmarkRent2BHK: 22500,
    aqiBaseline: 58,
    hospitalCount: 12,
    groceryCount: 24,
    metroConnected: true,
    transitScore: 85,
    tags: ['Clean Air', 'Green Line Metro', 'Traditional Culture', 'Low Cost of Living']
  },
  {
    city: 'bangalore',
    key: 'malleshwaram',
    name: 'Malleshwaram',
    zone: 'North-West',
    description: 'Classic Old Bangalore soul with sampige trees, heritage tiffin rooms (CTR, Veena Stores), IISc proximity, and Green Line Metro.',
    centroid: [77.5643, 13.0031],
    polygon: [
      [77.550, 12.990], [77.580, 12.990], [77.580, 13.020], [77.550, 13.020], [77.550, 12.990]
    ],
    benchmarkRent1BHK: 17500,
    benchmarkRent2BHK: 31000,
    aqiBaseline: 65,
    hospitalCount: 18,
    groceryCount: 30,
    metroConnected: true,
    transitScore: 93,
    tags: ['Heritage Tiffin', 'IISc Proximity', 'Green Line Metro', 'Safe & Walkable']
  },
  {
    city: 'bangalore',
    key: 'rajajinagar',
    name: 'Rajajinagar',
    zone: 'West',
    description: 'Major commercial and residential powerhouse. Home to Brigade Gateway (World Trade Center, Orion Mall, Columbia Asia Hospital) and Green Line Metro.',
    centroid: [77.5530, 12.9982],
    polygon: [
      [77.535, 12.980], [77.570, 12.980], [77.570, 13.015], [77.535, 13.015], [77.535, 12.980]
    ],
    benchmarkRent1BHK: 16000,
    benchmarkRent2BHK: 28000,
    aqiBaseline: 75,
    hospitalCount: 17,
    groceryCount: 29,
    metroConnected: true,
    transitScore: 91,
    tags: ['World Trade Center', 'Orion Mall', 'Green Line Metro', 'Top Hospitals']
  },
  {
    city: 'bangalore',
    key: 'hebbal',
    name: 'Hebbal',
    zone: 'North',
    description: 'Gateway to North Bangalore and Kempegowda Airport. Famous Hebbal Flyover, lake, luxury high-rises, and rapid connectivity to Manyata Tech Park.',
    centroid: [77.5970, 13.0358],
    polygon: [
      [77.580, 13.020], [77.620, 13.020], [77.620, 13.055], [77.580, 13.055], [77.580, 13.020]
    ],
    benchmarkRent1BHK: 16500,
    benchmarkRent2BHK: 29000,
    aqiBaseline: 78,
    hospitalCount: 14,
    groceryCount: 25,
    metroConnected: false,
    transitScore: 82,
    tags: ['Airport Corridor', 'Hebbal Lake', 'Manyata Adjacent', 'Luxury High-Rises']
  },
  {
    city: 'bangalore',
    key: 'yelahanka',
    name: 'Yelahanka',
    zone: 'North',
    description: 'Breezy northern suburb with cleaner air, sprawling defense establishments, lakes, defense green belts, and excellent airport highway access.',
    centroid: [77.5963, 13.1007],
    polygon: [
      [77.570, 13.080], [77.625, 13.080], [77.625, 13.125], [77.570, 13.125], [77.570, 13.080]
    ],
    benchmarkRent1BHK: 11500,
    benchmarkRent2BHK: 20000,
    aqiBaseline: 48,
    hospitalCount: 8,
    groceryCount: 21,
    metroConnected: false,
    transitScore: 73,
    tags: ['Clean Air (Low AQI)', 'Peaceful Living', 'Airport Highway', 'Great Value']
  },
  {
    city: 'bangalore',
    key: 'thanisandra',
    name: 'Thanisandra (Manyata Hub)',
    zone: 'North',
    description: 'Directly abutting Manyata Tech Park. Modern high-rise societies, rapid retail development, preferred home for North Bangalore IT professionals.',
    centroid: [77.6322, 13.0543],
    polygon: [
      [77.615, 13.035], [77.655, 13.035], [77.655, 13.075], [77.615, 13.075], [77.615, 13.035]
    ],
    benchmarkRent1BHK: 15000,
    benchmarkRent2BHK: 26000,
    aqiBaseline: 80,
    hospitalCount: 9,
    groceryCount: 22,
    metroConnected: false,
    transitScore: 77,
    tags: ['Walk to Manyata', 'High-Rise Living', 'Fast Growing', 'North IT Hub']
  },
  {
    city: 'bangalore',
    key: 'sadashivanagar',
    name: 'Sadashivanagar',
    zone: 'Central-North',
    description: 'Bangalore\'s most prestigious ultra-luxury residential neighborhood. Home to industrialists and diplomats. Lush Sankey Tank views and pristine serenity.',
    centroid: [77.5813, 13.0068],
    polygon: [
      [77.570, 12.998], [77.595, 12.998], [77.595, 13.018], [77.570, 13.018], [77.570, 12.998]
    ],
    benchmarkRent1BHK: 30000,
    benchmarkRent2BHK: 55000,
    aqiBaseline: 52,
    hospitalCount: 10,
    groceryCount: 16,
    metroConnected: false,
    transitScore: 84,
    tags: ['Ultra Luxury', 'Sankey Tank', 'Elite Privacy', 'Pristine Air']
  },
  {
    city: 'bangalore',
    key: 'kalyan_nagar',
    name: 'Kalyan Nagar / HRBR Layout',
    zone: 'North-East',
    description: 'Cosmopolitan enclave with Kammanahalli\'s multicultural dining strip, wide avenues, lively cafes, and strong community feel.',
    centroid: [77.6403, 13.0221],
    polygon: [
      [77.625, 13.005], [77.660, 13.005], [77.660, 13.035], [77.625, 13.035], [77.625, 13.005]
    ],
    benchmarkRent1BHK: 15000,
    benchmarkRent2BHK: 26500,
    aqiBaseline: 74,
    hospitalCount: 11,
    groceryCount: 27,
    metroConnected: false,
    transitScore: 81,
    tags: ['Cosmopolitan Cafes', 'Kammanahalli Strip', 'Expat Community', 'Good Schools']
  },
  {
    city: 'bangalore',
    key: 'sarjapur_road',
    name: 'Sarjapur Road',
    zone: 'East-South',
    description: 'Major suburban corridor packed with top international schools, Wipro campus, gated villas, and modern residential townships.',
    centroid: [77.6854, 12.9103],
    polygon: [
      [77.665, 12.890], [77.715, 12.890], [77.715, 12.930], [77.665, 12.930], [77.665, 12.890]
    ],
    benchmarkRent1BHK: 17000,
    benchmarkRent2BHK: 30000,
    aqiBaseline: 85,
    hospitalCount: 10,
    groceryCount: 24,
    metroConnected: false,
    transitScore: 70,
    tags: ['International Schools', 'Wipro Campus', 'Family Townships', 'Gated Communities']
  },

  // ----------------------------------------------------
  // PUNE (16 Micro-Markets)
  // ----------------------------------------------------
  {
    city: 'pune',
    key: 'hinjawadi_phase1',
    name: 'Hinjawadi Phase 1',
    zone: 'West Pune',
    description: 'The core IT epicenter of Pune with zero commute to Infosys, Wipro, and TCS. Bustling bachelor crowd, abundant PGs, and ongoing Metro Line 3 work.',
    centroid: [73.7380, 18.5912],
    polygon: [
      [73.720, 18.580], [73.755, 18.580], [73.755, 18.605], [73.720, 18.605], [73.720, 18.580]
    ],
    benchmarkRent1BHK: 13500,
    benchmarkRent2BHK: 22000,
    aqiBaseline: 65,
    hospitalCount: 8,
    groceryCount: 22,
    metroConnected: true,
    transitScore: 78,
    tags: ['Tech Park Epicenter', 'Walk to Infosys', 'Affordable Living', 'Pune Metro Line 3']
  },
  {
    city: 'pune',
    key: 'hinjawadi_phase2_3',
    name: 'Hinjawadi Phase 2 & 3',
    zone: 'West Pune',
    description: 'Deep IT campus corridor featuring sprawling green SEZs (Tech Mahindra, Cognizant, Credit Suisse). Budget-friendly gated mid-rises with mountain breezes.',
    centroid: [73.7020, 18.5840],
    polygon: [
      [73.680, 18.570], [73.720, 18.570], [73.720, 18.598], [73.680, 18.598], [73.680, 18.570]
    ],
    benchmarkRent1BHK: 11000,
    benchmarkRent2BHK: 18000,
    aqiBaseline: 55,
    hospitalCount: 5,
    groceryCount: 16,
    metroConnected: false,
    transitScore: 64,
    tags: ['Budget Friendly', 'Quiet Living', 'Tech Mahindra Campus', 'Clean Hill Air']
  },
  {
    city: 'pune',
    key: 'wakad',
    name: 'Wakad',
    zone: 'West-North Pune',
    description: 'Top residential choice for IT professionals working in Hinjawadi. Dynamic community life, Dutta Mandir road shopping, and Phoenix Mall of the Millennium.',
    centroid: [73.7667, 18.5988],
    polygon: [
      [73.745, 18.585], [73.785, 18.585], [73.785, 18.612], [73.745, 18.612], [73.745, 18.585]
    ],
    benchmarkRent1BHK: 16000,
    benchmarkRent2BHK: 26000,
    aqiBaseline: 72,
    hospitalCount: 12,
    groceryCount: 28,
    metroConnected: false,
    transitScore: 82,
    tags: ['Phoenix Mall', 'High Retail Density', 'Hinjawadi Gateway', 'Young Families']
  },
  {
    city: 'pune',
    key: 'baner',
    name: 'Baner',
    zone: 'West Pune',
    description: 'Upscale residential haven blending green hills with prime lifestyle. Vibrant cafes, breweries, co-working centers, and direct highway connectivity.',
    centroid: [73.7898, 18.5590],
    polygon: [
      [73.770, 18.545], [73.805, 18.545], [73.805, 18.575], [73.770, 18.575], [73.770, 18.545]
    ],
    benchmarkRent1BHK: 20000,
    benchmarkRent2BHK: 34000,
    aqiBaseline: 70,
    hospitalCount: 14,
    groceryCount: 30,
    metroConnected: true,
    transitScore: 88,
    tags: ['Boutique Cafes', 'Baner Hill Views', 'Modern High-Rises', 'Trendy Nightlife']
  },
  {
    city: 'pune',
    key: 'balewadi',
    name: 'Balewadi (High Street)',
    zone: 'West Pune',
    description: 'Famous for Balewadi High Street\'s pedestrian dining and sports complexes. Premium apartments, corporate offices, and cosmopolitan youth crowd.',
    centroid: [73.7712, 18.5780],
    polygon: [
      [73.755, 18.565], [73.790, 18.565], [73.790, 18.590], [73.755, 18.590], [73.755, 18.565]
    ],
    benchmarkRent1BHK: 18500,
    benchmarkRent2BHK: 31000,
    aqiBaseline: 68,
    hospitalCount: 10,
    groceryCount: 25,
    metroConnected: false,
    transitScore: 84,
    tags: ['Balewadi High Street', 'Sports Complex', 'Vibrant Dining', 'Cosmopolitan']
  },
  {
    city: 'pune',
    key: 'aundh',
    name: 'Aundh',
    zone: 'Central-West Pune',
    description: 'Mature, wealthy residential suburb with lush rain trees, premium medical centers, top schools, and quick access to Pune University and Baner.',
    centroid: [73.8062, 18.5626],
    polygon: [
      [73.790, 18.550], [73.825, 18.550], [73.825, 18.578], [73.790, 18.578], [73.790, 18.550]
    ],
    benchmarkRent1BHK: 19000,
    benchmarkRent2BHK: 32000,
    aqiBaseline: 64,
    hospitalCount: 16,
    groceryCount: 27,
    metroConnected: false,
    transitScore: 90,
    tags: ['Mature Neighborhood', 'Pune University', 'High Healthcare Access', 'Tree-Lined Streets']
  },
  {
    city: 'pune',
    key: 'kharadi',
    name: 'Kharadi (EON Free Zone)',
    zone: 'East Pune',
    description: 'East Pune\'s tech nerve center. Sprawling luxury townships, riverfront developments, EON Free Zone, and global banking operations.',
    centroid: [73.9442, 18.5538],
    polygon: [
      [73.925, 18.535], [73.965, 18.535], [73.965, 18.570], [73.925, 18.570], [73.925, 18.535]
    ],
    benchmarkRent1BHK: 18000,
    benchmarkRent2BHK: 30000,
    aqiBaseline: 82,
    hospitalCount: 11,
    groceryCount: 26,
    metroConnected: false,
    transitScore: 78,
    tags: ['EON Free Zone', 'World Trade Center', 'Gated Townships', 'Mula Mutha Riverfront']
  },
  {
    city: 'pune',
    key: 'viman_nagar',
    name: 'Viman Nagar',
    zone: 'East Pune',
    description: 'Youthful and cosmopolitan hub adjacent to Pune Airport. Home to Symbiosis colleges, Phoenix Marketcity, jogger parks, and vibrant cafe streets.',
    centroid: [73.9143, 18.5679],
    polygon: [
      [73.895, 18.555], [73.930, 18.555], [73.930, 18.580], [73.895, 18.580], [73.895, 18.555]
    ],
    benchmarkRent1BHK: 22000,
    benchmarkRent2BHK: 36000,
    aqiBaseline: 76,
    hospitalCount: 13,
    groceryCount: 31,
    metroConnected: true,
    transitScore: 93,
    tags: ['Phoenix Marketcity', 'Symbiosis Campus', 'Airport Proximity', 'Aqua Line Metro']
  },
  {
    city: 'pune',
    key: 'kalyani_nagar',
    name: 'Kalyani Nagar',
    zone: 'Central-East Pune',
    description: 'Prestigious residential address favored by expats and senior executives. Upscale dining, Cerebrum IT Park, jogger parks, and Koregaon Park bridge.',
    centroid: [73.9056, 18.5489],
    polygon: [
      [73.890, 18.535], [73.920, 18.535], [73.920, 18.560], [73.890, 18.560], [73.890, 18.535]
    ],
    benchmarkRent1BHK: 24000,
    benchmarkRent2BHK: 40000,
    aqiBaseline: 70,
    hospitalCount: 12,
    groceryCount: 24,
    metroConnected: true,
    transitScore: 91,
    tags: ['Elite Residential', 'Aqua Line Metro', 'Cerebrum IT Park', 'Expat Friendly']
  },
  {
    city: 'pune',
    key: 'koregaon_park',
    name: 'Koregaon Park (KP)',
    zone: 'Central-East Pune',
    description: 'Pune\'s most renowned heritage and luxury neighborhood. Banyan tree canopies, Osho International Resort, European bakeries, and high-end living.',
    centroid: [73.8942, 18.5362],
    polygon: [
      [73.880, 18.525], [73.910, 18.525], [73.910, 18.548], [73.880, 18.548], [73.880, 18.525]
    ],
    benchmarkRent1BHK: 28000,
    benchmarkRent2BHK: 48000,
    aqiBaseline: 60,
    hospitalCount: 14,
    groceryCount: 22,
    metroConnected: false,
    transitScore: 89,
    tags: ['Iconic Tree Canopy', 'Osho Ashram', 'High Dining', 'Ultra Luxury']
  },
  {
    city: 'pune',
    key: 'magarpatta_city',
    name: 'Magarpatta City',
    zone: 'East Pune',
    description: 'Self-sufficient 430-acre integrated eco-township. Walk-to-work setup for Cybercity tech professionals, Aditi Gardens, solar power, and clean layout.',
    centroid: [73.9298, 18.5147],
    polygon: [
      [73.915, 18.500], [73.945, 18.500], [73.945, 18.530], [73.915, 18.530], [73.915, 18.500]
    ],
    benchmarkRent1BHK: 19000,
    benchmarkRent2BHK: 31000,
    aqiBaseline: 74,
    hospitalCount: 9,
    groceryCount: 20,
    metroConnected: false,
    transitScore: 82,
    tags: ['Gated Township', 'Aditi Gardens', 'Walk to Cybercity', 'High Green Cover']
  },
  {
    city: 'pune',
    key: 'hadapsar',
    name: 'Hadapsar',
    zone: 'East-South Pune',
    description: 'Rapidly expanding commercial bridge between Solapur Highway and Magarpatta. High availability of affordable 1BHK/2BHK units and busy local bazaars.',
    centroid: [73.9348, 18.4967],
    polygon: [
      [73.915, 18.480], [73.955, 18.480], [73.955, 18.510], [73.915, 18.510], [73.915, 18.480]
    ],
    benchmarkRent1BHK: 12500,
    benchmarkRent2BHK: 20500,
    aqiBaseline: 88,
    hospitalCount: 11,
    groceryCount: 25,
    metroConnected: false,
    transitScore: 74,
    tags: ['Budget Housing', 'Fast Transit', 'Industrial Hub', 'Commercial Bazaars']
  },
  {
    city: 'pune',
    key: 'kothrud',
    name: 'Kothrud',
    zone: 'South-West Pune',
    description: 'Pune\'s quintessential cultural bastion. Vanaz Metro terminal, MIT World Peace University, cultural institutions, peaceful family environment.',
    centroid: [73.8080, 18.5074],
    polygon: [
      [73.785, 18.490], [73.830, 18.490], [73.830, 18.525], [73.785, 18.525], [73.785, 18.490]
    ],
    benchmarkRent1BHK: 17000,
    benchmarkRent2BHK: 28000,
    aqiBaseline: 62,
    hospitalCount: 19,
    groceryCount: 33,
    metroConnected: true,
    transitScore: 94,
    tags: ['Aqua Line Metro', 'Traditional Pune', 'MIT Campus', 'High Healthcare Access']
  },
  {
    city: 'pune',
    key: 'sb_road',
    name: 'Senapati Bapat Road (SB Road)',
    zone: 'Central-West Pune',
    description: 'Central business and cultural district near Symbiosis and Chatushrungi Temple. Quick access to Shivajinagar, ICC Towers, and Deccan Gymkhana.',
    centroid: [73.8315, 18.5308],
    polygon: [
      [73.815, 18.520], [73.845, 18.520], [73.845, 18.545], [73.815, 18.545], [73.815, 18.520]
    ],
    benchmarkRent1BHK: 22000,
    benchmarkRent2BHK: 38000,
    aqiBaseline: 68,
    hospitalCount: 15,
    groceryCount: 26,
    metroConnected: true,
    transitScore: 92,
    tags: ['ICC Towers', 'Symbiosis Distance', 'Chatushrungi Temple', 'Central Hub']
  },
  {
    city: 'pune',
    key: 'pimple_saudagar',
    name: 'Pimple Saudagar',
    zone: 'North-West Pune',
    description: 'Carefully planned modern residential corridor near PCMC linear gardens. Wide avenues, popular with Hinjawadi tech families, top supermarkets.',
    centroid: [73.7925, 18.5980],
    polygon: [
      [73.775, 18.585], [73.810, 18.585], [73.810, 18.610], [73.775, 18.610], [73.775, 18.585]
    ],
    benchmarkRent1BHK: 15500,
    benchmarkRent2BHK: 26500,
    aqiBaseline: 66,
    hospitalCount: 11,
    groceryCount: 29,
    metroConnected: false,
    transitScore: 81,
    tags: ['Linear Gardens', 'Planned Townships', 'Family Centric', 'Hinjawadi Link']
  },
  {
    city: 'pune',
    key: 'bavdhan',
    name: 'Bavdhan',
    zone: 'West-South Pune',
    description: 'Scenic hillside enclave nestled between NDA and Kothrud. Cleaner air, low density living, scenic Pashan Lake views, and quick highway access.',
    centroid: [73.7752, 18.5135],
    polygon: [
      [73.755, 18.498], [73.795, 18.498], [73.795, 18.530], [73.755, 18.530], [73.755, 18.498]
    ],
    benchmarkRent1BHK: 15000,
    benchmarkRent2BHK: 25000,
    aqiBaseline: 55,
    hospitalCount: 8,
    groceryCount: 19,
    metroConnected: false,
    transitScore: 72,
    tags: ['Clean Mountain Air', 'Pashan Lake', 'NDA Foothills', 'Tranquil Residential']
  }
];

export const BANGALORE_NEIGHBORHOODS: RawNeighborhoodData[] = ALL_NEIGHBORHOODS.filter(n => n.city === 'bangalore');
export const PUNE_NEIGHBORHOODS: RawNeighborhoodData[] = ALL_NEIGHBORHOODS.filter(n => n.city === 'pune');

