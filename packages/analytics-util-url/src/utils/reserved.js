/**
 * Check for reserved keys
 *
 * @param {String} k string to check
 * @returns {Boolean}
 */
export function isReserved(k) {
  return k === '__proto__' || k === 'constructor'
}