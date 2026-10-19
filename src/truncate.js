/**
 * Shortens `text` to at most `limit` Unicode code points, appending an
 * ellipsis when it has to cut. The ellipsis counts inside the budget: the
 * kept prefix holds at most `limit - 1` code points with any trailing
 * whitespace removed, followed by U+2026. Full contract in README.md.
 *
 * @param {string} text
 * @param {number} limit integer >= 1
 * @returns {string}
 * @throws {TypeError} if `text` is not a string, or `limit` is not an
 *   integer >= 1.
 */
export function truncate(text, limit) {
  if (typeof text !== "string") {
    throw new TypeError("text must be a string");
  }
  if (!Number.isInteger(limit) || limit < 1) {
    throw new TypeError("limit must be an integer >= 1");
  }

  const codePoints = [...text];
  if (codePoints.length <= limit) return text;

  const prefix = codePoints.slice(0, limit - 1).join("").replace(/\s+$/, "");
  return prefix + "\u2026";
}
