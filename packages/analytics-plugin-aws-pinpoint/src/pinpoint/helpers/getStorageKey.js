export const ENDPOINT_KEY = '__endpoint'

export function getStorageKey(id) {
  return `${ENDPOINT_KEY}.${id}`
}