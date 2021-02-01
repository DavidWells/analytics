import { isArray } from 'analytics-utils'

export default function ensureArray(singleOrArray) {
  if (!singleOrArray) return []
  if (isArray(singleOrArray)) return singleOrArray
  return [singleOrArray] 
}