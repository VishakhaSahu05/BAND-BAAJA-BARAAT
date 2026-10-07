/** Field names of the unique index a MongoDB E11000 duplicate-key error hit, or null for any other error. */
export function duplicateKeyFields(error: unknown): string[] | null {
  if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== 11000) {
    return null;
  }
  const keyPattern = 'keyPattern' in error ? error.keyPattern : undefined;
  return typeof keyPattern === 'object' && keyPattern !== null ? Object.keys(keyPattern) : [];
}
