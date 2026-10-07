import { Types } from 'mongoose';
import { GuestModel } from './guests.model.ts';

/** Total invited capacity: the sum of `maxGuests` across all guest records. */
export async function sumMaxGuests(weddingId: string): Promise<number> {
  const [result] = await GuestModel.aggregate<{ total: number }>([
    { $match: { weddingId: new Types.ObjectId(weddingId) } },
    { $group: { _id: null, total: { $sum: '$maxGuests' } } },
  ]);
  return result?.total ?? 0;
}

/** Confirmed headcount; an ATTENDING record without a count is treated as one person. */
export async function sumAttendingCount(weddingId: string): Promise<number> {
  const [result] = await GuestModel.aggregate<{ total: number }>([
    { $match: { weddingId: new Types.ObjectId(weddingId), rsvpStatus: 'ATTENDING' } },
    { $group: { _id: null, total: { $sum: { $ifNull: ['$attendingCount', 1] } } } },
  ]);
  return result?.total ?? 0;
}
