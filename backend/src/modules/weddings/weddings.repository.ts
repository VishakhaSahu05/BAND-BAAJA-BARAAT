import type { ClientSession } from 'mongoose';
import {
  WeddingMembershipModel,
  WeddingModel,
  type WeddingAttributes,
  type WeddingDocument,
  type WeddingMembershipDocument,
} from './weddings.model.ts';

export async function createWedding(
  input: Omit<WeddingAttributes, 'createdAt' | 'updatedAt'>,
  session: ClientSession,
): Promise<WeddingDocument> {
  const [wedding] = await WeddingModel.create([input], { session });
  return wedding;
}

export async function createMembership(
  input: { userId: string; weddingId: string },
  session: ClientSession,
): Promise<WeddingMembershipDocument> {
  const [membership] = await WeddingMembershipModel.create(
    [{ userId: input.userId, weddingId: input.weddingId, access: 'OWNER', joinedAt: new Date() }],
    { session },
  );
  return membership;
}

export async function findMembershipByUserId(userId: string): Promise<WeddingMembershipDocument | null> {
  return WeddingMembershipModel.findOne({ userId });
}

export async function findWeddingById(weddingId: string): Promise<WeddingDocument | null> {
  return WeddingModel.findOne({ _id: weddingId, deletedAt: { $exists: false } });
}

export async function updateWedding(
  weddingId: string,
  update: { $set: Record<string, unknown>; $unset: Record<string, ''> },
): Promise<WeddingDocument | null> {
  return WeddingModel.findOneAndUpdate({ _id: weddingId, deletedAt: { $exists: false } }, update, {
    returnDocument: 'after',
    runValidators: true,
  });
}

export async function findWebsiteSlugExists(slug: string): Promise<boolean> {
  const existing = await WeddingModel.exists({ 'website.slug': slug });
  return existing !== null;
}
