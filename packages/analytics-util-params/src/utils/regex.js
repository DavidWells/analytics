
export const queryRegex = /([^=?&]+)(=)?([^&]*)/g

export function escapeRegexString(str) {
  return str.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&')
}

export function isArrayParam(key) {
  return key.substring(key.length - 2) === '[]'
}
