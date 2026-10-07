import { Types } from 'mongoose';
import { ExpenseModel } from './expenses.model.ts';

/** Sums INR expenses only; there is no currency conversion yet. */
export async function sumAmountPaise(weddingId: string): Promise<number> {
  const [result] = await ExpenseModel.aggregate<{ total: number }>([
    { $match: { weddingId: new Types.ObjectId(weddingId), currency: 'INR' } },
    { $group: { _id: null, total: { $sum: '$amountPaise' } } },
  ]);
  return result?.total ?? 0;
}
