import mongoose, { Schema, Document } from 'mongoose';

export interface ICityCache extends Document {
  cityKey: string;
  name: string;
  state: string;
  country: string;
  center: [number, number]; // [lat, lon]
  boundingBox: [number, number, number, number]; // [minLat, maxLat, minLon, maxLon]
  defaultZoom: number;
  description: string;
  metroLines: string[];
  aqiStationsCount: number;
  hasCpcbCoverage: boolean;
  hasRentData: boolean;
  localityCount: number;
  ingestedAt: Date;
  expiresAt: Date;
  status: 'ready' | 'ingesting' | 'failed';
}

const CityCacheSchema = new Schema<ICityCache>(
  {
    cityKey: { type: String, required: true, unique: true, index: true, lowercase: true },
    name: { type: String, required: true },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    center: { type: [Number], required: true }, // [lat, lon]
    boundingBox: { type: [Number], required: true }, // [minLat, maxLat, minLon, maxLon]
    defaultZoom: { type: Number, default: 11 },
    description: { type: String, default: '' },
    metroLines: { type: [String], default: [] },
    aqiStationsCount: { type: Number, default: 0 },
    hasCpcbCoverage: { type: Boolean, default: false },
    hasRentData: { type: Boolean, default: false },
    localityCount: { type: Number, default: 0 },
    ingestedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ['ready', 'ingesting', 'failed'], default: 'ready' }
  },
  { timestamps: true }
);

CityCacheSchema.index({ expiresAt: 1 });

export const CityCache = mongoose.model<ICityCache>('CityCache', CityCacheSchema);
