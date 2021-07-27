import analytics, { EVENTS, CONSTANTS } from '@analytics/core'
import storage from '@analytics/storage-utils'

// See ../packages/analytics-core for source code
export default function analyticsLib(opts = {}) {
  const defaultSettings = { storage }
  return analytics({
    ...defaultSettings,
    ...opts
  })
}

export { analyticsLib as init }
export { analyticsLib as Analytics }
export { EVENTS, CONSTANTS }
