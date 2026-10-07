/**
 * Turns a partial patch into a Mongo update: `undefined` fields are left alone,
 * `null` or empty-string fields are removed, everything else is set.
 */
export function buildUpdate(patch: Record<string, unknown>): {
  $set: Record<string, unknown>;
  $unset: Record<string, ''>;
} {
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, ''> = {};

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) {
      continue;
    }
    if (value === null || value === '') {
      $unset[key] = '';
    } else {
      $set[key] = value;
    }
  }

  return { $set, $unset };
}
