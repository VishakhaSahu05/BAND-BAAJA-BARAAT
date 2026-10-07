import { z } from 'zod';
import { isoDateInput } from '../../utils/zod-date.ts';

const locationSchema = z.object({
  formattedAddress: z.string().trim().min(1),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  country: z.string().trim().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  googlePlaceId: z.string().trim().min(1).optional(),
});

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

const timeZoneSchema = z.string().trim().min(1).refine(isValidTimeZone, 'Unknown time zone.');

const hashtagSchema = z
  .string()
  .trim()
  .max(100)
  .regex(/^#?[\w]+$/, 'Hashtag may only contain letters, numbers and underscores.');

const ritualSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.enum(['MEHENDI', 'HALDI', 'SANGEET', 'WEDDING', 'RECEPTION', 'CUSTOM']).optional(),
});

const guestEstimateSchema = z
  .object({
    total: z.number().int().min(0),
    groomSide: z.number().int().min(0),
    brideSide: z.number().int().min(0),
  })
  .refine((estimate) => estimate.groomSide + estimate.brideSide === estimate.total, {
    message: 'Groom side and bride side guests must add up to the total.',
    path: ['total'],
  });

export const createWeddingSchema = z.object({
  brideName: z.string().trim().min(1).max(200),
  groomName: z.string().trim().min(1).max(200),
  weddingDate: isoDateInput,
  timeZone: timeZoneSchema,
  location: locationSchema,
  budgetPaise: z.number().int().min(0).optional(),
  description: z.string().trim().max(2000).optional(),
  hashtag: hashtagSchema.optional(),
  rituals: z.array(ritualSchema).max(20).optional(),
  ceremonySpan: z.enum(['2_DAYS', '3_DAYS', '4_PLUS_DAYS']).optional(),
  guestEstimate: guestEstimateSchema.optional(),
  rsvpCollectionMode: z.enum(['WHATSAPP_SMS', 'MANUAL_LIST']).optional(),
  isItineraryPrivate: z.boolean().optional(),
});

export type CreateWeddingInput = z.infer<typeof createWeddingSchema>;

/** Every field is optional; `null` (or an empty string) clears an optional field. */
export const updateWeddingSchema = z
  .object({
    brideName: z.string().trim().min(1).max(200),
    groomName: z.string().trim().min(1).max(200),
    weddingDate: isoDateInput,
    timeZone: timeZoneSchema,
    location: locationSchema,
    budgetPaise: z.number().int().min(0).nullable(),
    description: z.string().trim().max(2000).nullable(),
    hashtag: z.union([hashtagSchema, z.literal('')]).nullable(),
    muhuratTimeLabel: z.string().trim().max(50).nullable(),
    venueOpsContact: z
      .object({
        name: z.string().trim().min(1).max(200),
        phoneNumber: z
          .string()
          .trim()
          .min(5)
          .max(20)
          .regex(/^\+?[\d\s-]+$/, 'Phone number may only contain digits, spaces, dashes and a leading +.'),
      })
      .nullable(),
  })
  .partial()
  .strict();

export type UpdateWeddingInput = z.infer<typeof updateWeddingSchema>;
