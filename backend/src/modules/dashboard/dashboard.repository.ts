import { Types } from 'mongoose';
import { WeddingMembershipModel } from '../weddings/weddings.model.ts';

export interface FamilyCircleRow {
  _id: Types.ObjectId;
  name: string;
  relationshipLabel?: string;
}

export async function listFamilyCircle(weddingId: string): Promise<FamilyCircleRow[]> {
  return WeddingMembershipModel.aggregate<FamilyCircleRow>([
    { $match: { weddingId: new Types.ObjectId(weddingId) } },
    { $sort: { joinedAt: 1 } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { name: '$user.name', relationshipLabel: 1 } },
  ]);
}
