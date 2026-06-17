/**
 * Sanitize a raw ad keyword (e.g. Google ValueTrack `{keyword}` passed via `?kw=`)
 * for safe insertion as the first line of the marketing H1. Returns null when the
 * value is missing, too short, too long, or empties out after stripping.
 */
export function sanitizeKeyword(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const stripped = raw
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N}\s'&-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length < 2 || stripped.length > 60) return null;
  // Capitalize the first letter of each whitespace-delimited word (not after apostrophes).
  return stripped.replace(/(^|\s)(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}
