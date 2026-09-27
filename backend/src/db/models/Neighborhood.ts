import mongoose, { Schema, Document } from 'mongoose';

export interface INeighborhood extends Document {
  city: string;
  key: string;
  name: string;
  zone: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // GeoJSON Polygon
  };
  benchmarkRent1BHK: number | null;
  benchmarkRent2BHK: number | null;
  rentAvailable: boolean;
  aqiBaseline: number;
  aqiSource: 'cpcb_measured' | 'owm_modeled';
  cpcbStationName?: string;
  cpcbDistanceKm?: number;
  hospitalCount: number;
  groceryCount: number;
  metroConnected: boolean;
  transitScore: number;
  isGridFallback?: boolean;
  boundarySource?: 'osm_locality' | 'voronoi_grid';
  dataQuality: {
    verifiedFactorsCount: number;
    coverageSummary: string;
    rentStatus: 'verified_benchmark' | 'unavailable';
    aqiStatus: 'measured_cpcb' | 'modeled_owm';
    amenityStatus: string;
    boundaryStatus?: 'osm_locality' | 'voronoi_grid';
    isGridFallback?: boolean;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NeighborhoodSchema: Schema = new Schema<INeighborhood>(
  {
    city: {
      type: String,
      required: true,
      lowercase: true,
      default: 'bangalore'
    },
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    zone: { type: String, required: true },
    description: { type: String, default: '' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lon, lat]
        required: true
      }
    },
    geometry: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
        default: 'Polygon'
      },
      coordinates: {
        type: [[[Number]]],
        required: true
      }
    },
    benchmarkRent1BHK: { type: Number, default: null },
    benchmarkRent2BHK: { type: Number, default: null },
    rentAvailable: { type: Boolean, default: true },
    aqiBaseline: { type: Number, required: true },
    aqiSource: { type: String, enum: ['cpcb_measured', 'owm_modeled'], default: 'owm_modeled' },
    cpcbStationName: { type: String },
    cpcbDistanceKm: { type: Number },
    hospitalCount: { type: Number, default: 0 },
    groceryCount: { type: Number, default: 0 },
    metroConnected: { type: Boolean, default: false },
    transitScore: { type: Number, default: 70 },
    isGridFallback: { type: Boolean, default: false },
    boundarySource: { type: String, enum: ['osm_locality', 'voronoi_grid'], default: 'osm_locality' },
    dataQuality: {
      type: {
        verifiedFactorsCount: { type: Number, default: 4 },
        coverageSummary: { type: String, default: '4/5 Factors' },
        rentStatus: { type: String, default: 'unavailable' },
        aqiStatus: { type: String, default: 'modeled_owm' },
        amenityStatus: { type: String, default: 'osm_live' },
        boundaryStatus: { type: String, default: 'osm_locality' },
        isGridFallback: { type: Boolean, default: false }
      },
      default: () => ({
        verifiedFactorsCount: 4,
        coverageSummary: '4/5 Factors',
        rentStatus: 'unavailable',
        aqiStatus: 'modeled_owm',
        amenityStatus: 'osm_live',
        boundaryStatus: 'osm_locality',
        isGridFallback: false
      })
    },
    tags: { type: [String], default: [] }

  },
  {
    timestamps: true
  }
);

// 2dsphere Geospatial Indexes for MongoDB spatial operators
NeighborhoodSchema.index({ location: '2dsphere' });
NeighborhoodSchema.index({ geometry: '2dsphere' });
NeighborhoodSchema.index({ city: 1, key: 1 });

export const Neighborhood = mongoose.model<INeighborhood>('Neighborhood', NeighborhoodSchema);
