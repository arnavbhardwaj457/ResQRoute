import { Schema, model } from 'mongoose';

type LatLng = {
  lat: number;
  lng: number;
};

export type EmergencyDocument = {
  userId?: string;
  description?: string;
  location: LatLng;
  nearestHospitalId?: Schema.Types.ObjectId;
  status: 'active' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
};

const emergencySchema = new Schema<EmergencyDocument>(
  {
    userId: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    nearestHospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: false,
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);

export const EmergencyModel = model<EmergencyDocument>('Emergency', emergencySchema);
