import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkplace extends Document {
  city: 'bangalore' | 'pune';
  key: string;
  name: string;
  zone: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lon, lat]
  };
  description: string;
  tags: string[];
}

const WorkplaceSchema: Schema = new Schema<IWorkplace>(
  {
    city: {
      type: String,
      required: true,
      lowercase: true,
      enum: ['bangalore', 'pune'],
      default: 'bangalore'
    },
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    zone: { type: String, required: true },
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
    description: { type: String, default: '' },
    tags: { type: [String], default: [] }
  },
  {
    timestamps: true
  }
);

WorkplaceSchema.index({ location: '2dsphere' });
WorkplaceSchema.index({ city: 1 });

export const Workplace = mongoose.model<IWorkplace>('Workplace', WorkplaceSchema);
