/**
 * Decode URI string
 *
 * @param {String} s string to decode
 * @returns {String} decoded string
 * @example
 * decodeUri("Bought%20keyword)
 * => "Bought keyword"
 */
export function decodeUri(s) {
  // decodeURIComponent(s.replace(/\+/g, ' '))
  return decodeURIComponent(s)
}