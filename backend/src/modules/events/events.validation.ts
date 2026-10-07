import { z } from 'zod';
import { isoDateInput } from '../../utils/zod-date.ts';

const eventTypeSchema = z.enum(['MEHENDI', 'HALDI', 'SANGEET', 'WEDDING', 'RECEPTION', 'CUSTOM']);

export const createEventSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    type: eventTypeSchema.optional(),
    startsAt: isoDateInput,
    endsAt: isoDateInput.optional(),
    venueName: z.string().trim().max(200).optional(),
    address: z.string().trim().max(500).optional(),
    description: z.string().trim().max(2000).optional(),
  })
  .strict();

export type CreateEventInput = z.infer<typeof createEventSchema>;

/** Every field is optional; `null` (or an empty string) clears an optional field. */
export const updateEventSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    type: eventTypeSchema,
    startsAt: isoDateInput,
    venueName: z.string().trim().max(200).nullable(),
    address: z.string().trim().max(500).nullable(),
    description: z.string().trim().max(2000).nullable(),
  })
  .partial()
  .strict();

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
