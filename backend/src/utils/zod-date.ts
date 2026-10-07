import { z } from 'zod';

/**
 * Accepts an ISO date ("2027-02-14") or datetime string and coerces it to a Date.
 * Plain `z.coerce.date()` would turn `null` into 1970-01-01, so non-strings are rejected first.
 */
export const isoDateInput = z.union([z.iso.date(), z.iso.datetime({ offset: true })]).pipe(z.coerce.date());
