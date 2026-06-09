export function parsePageLimit(
  limit?: string,
  defaultLimit = 50,
  max = 500,
): number {
  const parsed = parseInt(limit ?? String(defaultLimit), 10);
  if (Number.isNaN(parsed) || parsed < 1) return defaultLimit;
  return Math.min(parsed, max);
}

export function encodeCursor(iso: string, id: string): string {
  return Buffer.from(`${iso}:${id}`).toString('base64url');
}

export function decodeCursor(
  cursor: string,
): { iso: string; id: string } | null {
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    const sep = raw.indexOf(':');
    if (sep <= 0) return null;
    return { iso: raw.slice(0, sep), id: raw.slice(sep + 1) };
  } catch {
    return null;
  }
}
