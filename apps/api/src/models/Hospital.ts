import { Schema, model } from 'mongoose';

type LatLng = {
  lat: number;
  lng: number;
};

export type HospitalDocument = {
  name: string;
  location: LatLng;
  address: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
};

const hospitalSchema = new Schema<HospitalDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const HospitalModel = model<HospitalDocument>('Hospital', hospitalSchema);
