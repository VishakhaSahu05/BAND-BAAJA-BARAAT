import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export type VendorSource = 'MANUAL' | 'GOOGLE_PLACES';

export interface VendorAttributes {
  weddingId: Types.ObjectId;
  name: string;
  category: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  totalAgreedCostPaise?: number;
  eventIds?: Types.ObjectId[];
  notes?: string;
  source: VendorSource;
  googlePlaceId?: string;
  // Not in DB design v2.0; added to back the dashboard's "Vendor Contracts" metric.
  isContractSigned: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type VendorDocument = HydratedDocument<VendorAttributes>;

const vendorSchema = new Schema<VendorAttributes>(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: 'Wedding', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    website: { type: String, trim: true },
    totalAgreedCostPaise: { type: Number, min: 0 },
    eventIds: { type: [Schema.Types.ObjectId], ref: 'Event' },
    notes: { type: String, trim: true },
    source: { type: String, enum: ['MANUAL', 'GOOGLE_PLACES'], required: true, default: 'MANUAL' },
    googlePlaceId: { type: String },
    isContractSigned: { type: Boolean, required: true, default: false },
    archivedAt: { type: Date },
  },
  { timestamps: true },
);

vendorSchema.index({ weddingId: 1, category: 1 });
vendorSchema.index({ weddingId: 1, archivedAt: 1 });
vendorSchema.index({ weddingId: 1, googlePlaceId: 1 });

export const VendorModel: Model<VendorAttributes> = model<VendorAttributes>('Vendor', vendorSchema);
