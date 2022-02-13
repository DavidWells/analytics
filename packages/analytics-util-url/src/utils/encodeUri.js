/**
 * Encode URI string
 *
 * @param {String} s string to decode
 * @returns {String} decoded string
 * @example
 * encodeUri("Bought keyword")
 * => "Bought%20keyword"
 */
export function encodeUri(s) {
  return encodeURIComponent(s)
}