import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export interface ExpenseAttributes {
  weddingId: Types.ObjectId;
  title: string;
  amountPaise: number;
  currency: string;
  expenseDate?: Date;
  category: string;
  eventId?: Types.ObjectId;
  vendorId?: Types.ObjectId;
  notes?: string;
  createdByMembershipId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseDocument = HydratedDocument<ExpenseAttributes>;

const expenseSchema = new Schema<ExpenseAttributes>(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: 'Wedding', required: true },
    title: { type: String, required: true, trim: true },
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'amountPaise must be an integer.' },
    },
    currency: { type: String, required: true, default: 'INR' },
    expenseDate: { type: Date },
    category: { type: String, required: true, trim: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    notes: { type: String, trim: true },
    createdByMembershipId: { type: Schema.Types.ObjectId, ref: 'WeddingMembership', required: true },
  },
  { timestamps: true },
);

expenseSchema.index({ weddingId: 1, expenseDate: 1 });
expenseSchema.index({ weddingId: 1, category: 1 });
expenseSchema.index({ weddingId: 1, eventId: 1 });
expenseSchema.index({ weddingId: 1, vendorId: 1 });

export const ExpenseModel: Model<ExpenseAttributes> = model<ExpenseAttributes>('Expense', expenseSchema);
