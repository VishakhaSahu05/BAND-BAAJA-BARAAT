import { Types } from 'mongoose';
import { VendorModel } from './vendors.model.ts';

export async function countContractStatus(weddingId: string): Promise<{ total: number; signed: number }> {
  const [result] = await VendorModel.aggregate<{ total: number; signed: number }>([
    { $match: { weddingId: new Types.ObjectId(weddingId), archivedAt: null } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        signed: { $sum: { $cond: ['$isContractSigned', 1, 0] } },
      },
    },
  ]);
  return { total: result?.total ?? 0, signed: result?.signed ?? 0 };
}
