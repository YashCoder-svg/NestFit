import mongoose from 'mongoose';
import { config } from '../config';
import { Neighborhood } from './models/Neighborhood';
import { Workplace } from './models/Workplace';
import { BANGALORE_NEIGHBORHOODS, BANGALORE_WORKPLACES } from '../data/bangaloreData';
import { osmService } from '../services/osm.service';

async function runSeed() {
  const isLive = process.argv.includes('--live');
  console.log(`[Seed Pipeline] Starting Bangalore seed (liveOverpass=${isLive})...`);

  try {
    await mongoose.connect(config.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`[Seed Pipeline] Connected to MongoDB: ${config.MONGO_URI}`);

    // Clean existing
    await Neighborhood.deleteMany({});
    await Workplace.deleteMany({});

    // Seed Workplaces
    console.log(`[Seed Pipeline] Seeding ${BANGALORE_WORKPLACES.length} Tech Parks...`);
    for (const wp of BANGALORE_WORKPLACES) {
      await Workplace.create({
        key: wp.key,
        name: wp.name,
        zone: wp.zone,
        location: {
          type: 'Point',
          coordinates: wp.centroid
        },
        description: wp.description,
        tags: wp.tags
      });
    }

    // Seed Neighborhoods
    console.log(`[Seed Pipeline] Seeding ${BANGALORE_NEIGHBORHOODS.length} Neighborhoods...`);
    for (const n of BANGALORE_NEIGHBORHOODS) {
      let hospCount = n.hospitalCount;
      let grocCount = n.groceryCount;

      if (isLive) {
        console.log(`Fetching live OpenStreetMap POIs for ${n.name}...`);
        const livePOIs = await osmService.fetchPOIsAroundCentroid(n.centroid[1], n.centroid[0]);
        if (livePOIs.hospitals > 0) hospCount = livePOIs.hospitals;
        if (livePOIs.groceries > 0) grocCount = livePOIs.groceries;
      }

      await Neighborhood.create({
        key: n.key,
        name: n.name,
        zone: n.zone,
        description: n.description,
        location: {
          type: 'Point',
          coordinates: n.centroid
        },
        geometry: {
          type: 'Polygon',
          coordinates: [n.polygon]
        },
        benchmarkRent1BHK: n.benchmarkRent1BHK,
        benchmarkRent2BHK: n.benchmarkRent2BHK,
        aqiBaseline: n.aqiBaseline,
        hospitalCount: hospCount,
        groceryCount: grocCount,
        metroConnected: n.metroConnected,
        transitScore: n.transitScore,
        tags: n.tags
      });
    }

    console.log(`[Seed Pipeline] Success! Populated 20 Bangalore neighborhoods & 7 tech parks.`);
    process.exit(0);
  } catch (err: any) {
    console.error(`[Seed Pipeline] Failed: ${err.message}`);
    process.exit(1);
  }
}

runSeed();
