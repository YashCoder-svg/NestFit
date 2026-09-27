import mongoose, { Schema, Document } from 'mongoose';

export interface IRentBenchmark extends Document {
  cityKey: string;
  localityKey: string;
  localityName: string;
  benchmarkRent1BHK: number;
  benchmarkRent2BHK: number;
  source: string;
  confidence: 'high' | 'medium' | 'estimated';
  updatedAt: Date;
}

const RentBenchmarkSchema = new Schema<IRentBenchmark>(
  {
    cityKey: { type: String, required: true, lowercase: true, index: true },
    localityKey: { type: String, required: true, lowercase: true },
    localityName: { type: String, required: true },
    benchmarkRent1BHK: { type: Number, required: true },
    benchmarkRent2BHK: { type: Number, required: true },
    source: { type: String, default: 'Curated Benchmark Survey' },
    confidence: { type: String, enum: ['high', 'medium', 'estimated'], default: 'medium' }
  },
  { timestamps: true }
);

RentBenchmarkSchema.index({ cityKey: 1, localityKey: 1 }, { unique: true });

export const RentBenchmark = mongoose.model<IRentBenchmark>('RentBenchmark', RentBenchmarkSchema);
