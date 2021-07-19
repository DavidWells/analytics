/**
 * Decode URI string
 *
 * @param {String} s string to decode
 * @returns {String} decoded string
 * @example
 * decode("Bought%20keyword)
 * => "Bought keyword"
 */
export function decodeUri(s) {
  try {
    return decodeURIComponent(s.replace(/\+/g, ' '))
  } catch (e) {
    return null
  }
}
