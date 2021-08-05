import { parseReferrer } from 'analytics-utils'
import { getItem, setItem, LOCAL_STORAGE, COOKIE } from '@analytics/storage-utils'
import { isBrowser } from '@analytics/type-utils'
import { formatPipeString, parsePipeString } from './utils'

const events = {
  SET_ORIGINAL_SOURCE: 'setOriginalSource'
}

const CONFIG = {
  storage: LOCAL_STORAGE,
  originalSourceKey: '__user_original_source',
  originalLandingPageKey: '__user_original_landing_page'
}

/**
 * Track original source of visitors.
 * @param  {Object} [pluginConfig] - settings for referral source tracking
 * @param  {String} [pluginConfig.storage] - overide the location of storage. 'localStorage', 'cookie', or 'window'
 * @param  {String} [pluginConfig.originalSourceKey] - overide the storage key. Default '__user_original_source'
 * @param  {String} [pluginConfig.originalLandingPageKey] - overide the storage key. Default '__user_original_landing_page'
 * @return {Object} - plugin for `analytics` package
 */
export function originalSourcePlugin(pluginConfig = {}) {
  return {
    name: 'original-source',
    EVENTS: events,
    config: {
      ...CONFIG,
      ...pluginConfig
    },
    // Run function on `analyticsInit` event
    bootstrap: ({ instance, config }) => {
      instance.dispatch({
        type: events.SET_ORIGINAL_SOURCE,
        originalSource: getOriginalSource(config),
        originalLandingPage: getOriginalLandingPage(config)
      })
    },
    reset: ({ instance }) => {
      instance.storage.removeItem(CONFIG.originalSourceKey)
      instance.storage.removeItem(CONFIG.originalLandingPageKey)
    }
  }
}

export function getOriginalSource(opts = {}) {
  const config = Object.assign({}, CONFIG, opts)
  const { referrer, originalSourceKey } = config
  // 1. try first source browser storage
  const originalSrc = getItem(originalSourceKey, config.storage)
  if (originalSrc) {
    return parsePipeString(originalSrc)
  }
  // 2. then try __utmz cookie
  const utmzCookie = getItem('__utmz', COOKIE)
  if (utmzCookie) {
    const parsedCookie = parsePipeString(utmzCookie)
    if (parsedCookie) {
      setOriginalSource(parsedCookie, config)
      return parsedCookie
    }
  }
  // 3. Then try referrer url and utm params
  const ref = (isBrowser) ? (referrer || document.referrer) : ''
  const refData = parseReferrer(ref)
  setOriginalSource(refData, config)
  return refData
}

function setOriginalSource(data, config) {
  setItem(config.originalSourceKey, formatPipeString(data), config.storage)
}

/**
 * Get the original landing page of a visitor
 * @param  {Object} opts - plugin
 * @parama {String} opts.originalLandingPageKey - Storage key
 * @parama {String} opts.storage - Storage type
 * @return {String} original landing page uri
 */
export function getOriginalLandingPage(opts = {}) {
  const config = Object.assign({}, CONFIG, opts)
  const key = config.originalLandingPageKey
  const storageConfig = { storage: config.storage }
  // 1. try first source browser storage
  const originalLandingPage = getItem(key, storageConfig)
  if (originalLandingPage) {
    return originalLandingPage
  }
  const url = (isBrowser) ? window.location.href : ''
  setItem(key, url, storageConfig)
  return url
}
