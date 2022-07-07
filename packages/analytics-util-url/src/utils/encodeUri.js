/**
 * Encode URI string
 *
 * @param {String} s string to encode
 * @returns {String} encoded string
 * @example
 * encodeUri("Bought keyword")
 * => "Bought%20keyword"
 */
export function encodeUri(s) {
  return encodeURIComponent(s)
}