import { inBrowser, parseReferrer, getCookie, storage } from 'analytics-utils'
import { formatPipeString, parsePipeString } from './utils'

const events = {
  SET_ORIGINAL_SOURCE: 'setOriginalSource'
}

const CONFIG = {
  storage: 'localStorage',
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
export default function originalSourcePlugin(pluginConfig = {}) {
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
  const originalSrc = storage.getItem(originalSourceKey, {
    storage: config.storage
  })
  if (originalSrc) {
    return parsePipeString(originalSrc)
  }
  // 2. then try __utmz cookie
  const utmzCookie = getCookie('__utmz')
  if (utmzCookie) {
    const parsedCookie = parsePipeString(utmzCookie)
    if (parsedCookie) {
      setOriginalSource(parsedCookie, config)
      return parsedCookie
    }
  }
  // 3. Then try referrer url and utm params
  const ref = (inBrowser) ? (referrer || document.referrer) : ''
  const refData = parseReferrer(ref)
  setOriginalSource(refData, config)
  return refData
}

function setOriginalSource(data, config) {
  storage.setItem(config.originalSourceKey, formatPipeString(data), {
    storage: config.storage
  })
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
  const originalLandingPage = storage.getItem(key, storageConfig)
  if (originalLandingPage) {
    return originalLandingPage
  }
  const url = (inBrowser) ? window.location.href : ''
  storage.setItem(key, url, storageConfig)
  return url
}
