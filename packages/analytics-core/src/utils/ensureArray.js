import { isArray } from '@analytics/type-utils'

export default function ensureArray(singleOrArray) {
  if (!singleOrArray) return []
  if (isArray(singleOrArray)) return singleOrArray
  return [singleOrArray] 
}