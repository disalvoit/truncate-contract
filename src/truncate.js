/**
 * Shortens `text` to at most `limit` code points, appending an ellipsis when
 * it has to cut. The full contract lives in README.md.
 *
 * @param {string} text
 * @param {number} limit
 * @returns {string}
 */
export function truncate(text, limit) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }
  if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1) {
    throw new TypeError("limit must be an integer >= 1");
  }

  const chars = [...text];
  if (chars.length <= limit) return text;

  const prefix = chars.slice(0, limit - 1).join("").replace(/\s+$/, "");
  return prefix + "\u2026";
}
