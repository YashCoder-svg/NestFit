export interface RawNeighborhoodData {
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
  key: string;
  name: string;
  zone: string;
  centroid: [number, number]; // [lon, lat]
  description: string;
  tags: string[];
}

export const BANGALORE_WORKPLACES: RawWorkplaceData[] = [
  {
    key: 'ecospace_bellandur',
    name: 'RMZ Ecospace / Ecoworld (Outer Ring Road)',
    zone: 'East (ORR Corridor)',
    centroid: [77.6848, 12.9279],
    description: 'Bellandur Outer Ring Road tech corridor. Intel, Honeywell, Shell, Morgan Stanley, Cisco.',
    tags: ['ORR Tech Hub', 'Bellandur', 'High Congestion Corridor']
  },
  {
    key: 'manyata_tech_park',
    name: 'Manyata Embassy Business Park',
    zone: 'North (Nagavara / Thanisandra)',
    centroid: [77.6212, 13.0489],
    description: 'North Bangalore mega-park on Outer Ring Road. Cognizant, IBM, Philips, Nokia, Target.',
    tags: ['North Tech Hub', 'Airport Highway Proximity', 'Lake Facing']
  },
  {
    key: 'itpl_whitefield',
    name: 'ITPL / International Tech Park',
    zone: 'East (Whitefield)',
    centroid: [77.7370, 12.9863],
    description: 'Pioneering IT enclave in Whitefield with direct Purple Line Metro terminal access.',
    tags: ['Purple Line Metro', 'Whitefield Cluster', 'TCS & Mercedes']
  },
  {
    key: 'electronic_city_phase1',
    name: 'Electronic City Phase 1',
    zone: 'South (Electronic City)',
    centroid: [77.6602, 12.8452],
    description: 'Infosys & Wipro world headquarters, Siemens, Tech Mahindra, Yellow Line Metro.',
    tags: ['Elevated Expressway', 'Infosys HQ', 'Yellow Line Metro']
  },
  {
    key: 'bagmane_tech_park',
    name: 'Bagmane Tech Park (CV Raman Nagar)',
    zone: 'East-Central (Near Indiranagar)',
    centroid: [77.6580, 12.9806],
    description: 'Scenic tech park nestled near Byrasandra Lake. Google, Boeing, Oracle, Dell.',
    tags: ['Lake Enclave', 'Indiranagar Adjacent', 'Google & Boeing']
  },
  {
    key: 'embassy_golf_links',
    name: 'Embassy Golf Links (EGL)',
    zone: 'Central-East (Domlur / Koramangala)',
    centroid: [77.6430, 12.9515],
    description: 'Elite corporate park adjacent to KGA Golf Course. Goldman Sachs, IBM, Fidelity.',
    tags: ['Golf Course Facing', 'Koramangala Proximity', 'Goldman Sachs']
  },
  {
    key: 'world_trade_center',
    name: 'World Trade Center / Brigade Gateway',
    zone: 'West (Malleshwaram / Rajajinagar)',
    centroid: [77.5552, 13.0118],
    description: 'West Bangalore business hub featuring Orion Mall, Columbia Asia, and Green Line Metro.',
    tags: ['Green Line Metro', 'World Trade Center', 'Orion Mall Complex']
  }
];

export const BANGALORE_NEIGHBORHOODS: RawNeighborhoodData[] = [
  {
    key: 'koramangala',
    name: 'Koramangala',
    zone: 'South-East',
    description: "Bangalore's premier startup and dining hub. Vibrant nightlife, dense cafe culture, but higher rents and busy interior roads.",
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
    key: 'banashankari',
    name: 'Banashankari',
    zone: 'South-West',
    description: "Bangalore's largest residential locality. Peaceful temples, traditional markets, Green Line Metro terminal, extremely family-friendly.",
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
    key: 'sadashivanagar',
    name: 'Sadashivanagar',
    zone: 'Central-North',
    description: "Bangalore's most prestigious ultra-luxury residential neighborhood. Home to industrialists and diplomats. Lush Sankey Tank views and pristine serenity.",
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
    key: 'kalyan_nagar',
    name: 'Kalyan Nagar / HRBR Layout',
    zone: 'North-East',
    description: 'Cosmopolitan enclave with Kammanahalli’s multicultural dining strip, wide avenues, lively cafes, and strong community feel.',
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
  }
];
