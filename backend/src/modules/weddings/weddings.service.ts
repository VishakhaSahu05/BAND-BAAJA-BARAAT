import { randomBytes, createHash } from 'node:crypto';
import mongoose from 'mongoose';
import { ApiError } from '../../utils/api-error.ts';
import * as eventsRepository from '../events/events.repository.ts';
import type { WeddingMembershipDocument } from './weddings.model.ts';
import * as weddingsRepository from './weddings.repository.ts';
import { toPublicWedding, type PublicWedding } from './weddings.types.ts';
import { buildUpdate } from '../../utils/build-update.ts';
import { duplicateKeyFields } from '../../utils/mongo-errors.ts';
import type { CreateWeddingInput, UpdateWeddingInput } from './weddings.validation.ts';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueWebsiteSlug(brideName: string, groomName: string): Promise<string> {
  const base = slugify(`${brideName}-${groomName}`) || 'our-wedding';

  let candidate = base;
  let attempt = 0;

  while (await weddingsRepository.findWebsiteSlugExists(candidate)) {
    attempt += 1;
    candidate = `${base}-${randomBytes(3).toString('hex')}`;
    if (attempt > 10) {
      throw new ApiError('INTERNAL_ERROR', 'Could not generate a unique wedding website address.');
    }
  }

  return candidate;
}

function generateGalleryTokenHash(): string {
  const rawToken = randomBytes(32).toString('hex');
  return createHash('sha256').update(rawToken).digest('hex');
}

const MAX_SLUG_ATTEMPTS = 3;

export async function createWedding(userId: string, input: CreateWeddingInput): Promise<PublicWedding> {
  const existingMembership = await weddingsRepository.findMembershipByUserId(userId);
  if (existingMembership) {
    throw new ApiError('CONFLICT', 'You already have a wedding set up.');
  }

  // The slug is picked outside the transaction, so a concurrent create with the same couple names
  // can take it first; retry with a fresh slug when that happens.
  for (let attempt = 1; ; attempt += 1) {
    const websiteSlug = await generateUniqueWebsiteSlug(input.brideName, input.groomName);
    try {
      return await insertWeddingWithMembership(userId, input, websiteSlug);
    } catch (error) {
      const fields = duplicateKeyFields(error);
      // A concurrent double-submit by the same user passes the existence check above and then hits
      // the unique membership userId index.
      if (fields?.includes('userId')) {
        throw new ApiError('CONFLICT', 'You already have a wedding set up.');
      }
      if (fields?.includes('website.slug') && attempt < MAX_SLUG_ATTEMPTS) {
        continue;
      }
      throw error;
    }
  }
}

async function insertWeddingWithMembership(
  userId: string,
  input: CreateWeddingInput,
  websiteSlug: string,
): Promise<PublicWedding> {
  const session = await mongoose.startSession();
  try {
    let wedding;
    await session.withTransaction(async () => {
      wedding = await weddingsRepository.createWedding(
        {
          brideName: input.brideName,
          groomName: input.groomName,
          description: input.description,
          hashtag: input.hashtag,
          weddingDate: input.weddingDate,
          timeZone: input.timeZone,
          budgetPaise: input.budgetPaise,
          ceremonySpan: input.ceremonySpan,
          guestEstimate: input.guestEstimate,
          rsvpCollectionMode: input.rsvpCollectionMode,
          isItineraryPrivate: input.isItineraryPrivate ?? true,
          location: input.location,
          website: { slug: websiteSlug, theme: 'classic', isPublished: false },
          gallery: { tokenHash: generateGalleryTokenHash(), isEnabled: true, guestUploadsEnabled: true },
          livestream: { isEnabled: false },
          createdByUserId: new mongoose.Types.ObjectId(userId),
        },
        session,
      );

      await weddingsRepository.createMembership({ userId, weddingId: wedding._id.toString() }, session);

      if (input.rituals && input.rituals.length > 0) {
        await eventsRepository.createEvents(
          input.rituals.map((ritual) => ({
            weddingId: wedding!._id,
            name: ritual.name,
            type: ritual.type,
            startsAt: input.weddingDate,
          })),
          session,
        );
      }
    });

    if (!wedding) {
      throw new ApiError('INTERNAL_ERROR', 'Wedding creation failed unexpectedly.');
    }

    return toPublicWedding(wedding);
  } finally {
    await session.endSession();
  }
}

export async function assertWeddingMembership(
  userId: string,
  weddingId: string,
): Promise<WeddingMembershipDocument> {
  const membership = await weddingsRepository.findMembershipByUserId(userId);
  if (!membership || membership.weddingId.toString() !== weddingId) {
    throw new ApiError('FORBIDDEN', 'You do not have access to this wedding.');
  }
  return membership;
}

export async function updateWedding(
  userId: string,
  weddingId: string,
  input: UpdateWeddingInput,
): Promise<PublicWedding> {
  await assertWeddingMembership(userId, weddingId);

  const update = buildUpdate(input);
  const wedding = await weddingsRepository.updateWedding(weddingId, update);
  if (!wedding) {
    throw new ApiError('NOT_FOUND', 'Wedding not found.');
  }

  return toPublicWedding(wedding);
}

export async function getCurrentWedding(userId: string): Promise<PublicWedding> {
  const membership = await weddingsRepository.findMembershipByUserId(userId);
  if (!membership) {
    throw new ApiError('NOT_FOUND', 'No wedding is set up for this account yet.');
  }

  const wedding = await weddingsRepository.findWeddingById(membership.weddingId.toString());
  if (!wedding) {
    throw new ApiError('NOT_FOUND', 'No wedding is set up for this account yet.');
  }

  return toPublicWedding(wedding);
}
