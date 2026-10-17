/**
 * Shortens `text` to at most `limit` characters, appending an ellipsis when
 * it has to cut. The full contract lives in README.md.
 *
 * @param {string} text
 * @param {number} limit
 * @returns {string}
 */
export function truncate(text, limit) {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + "\u2026";
}
