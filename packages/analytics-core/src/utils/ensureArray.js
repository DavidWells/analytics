import { isString } from 'analytics-utils'

export default function ensureArray(strOrArr) {
  if (!strOrArr) return []
  return (isString(strOrArr)) ? [strOrArr] : strOrArr
}