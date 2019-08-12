/* global _hsq */

export const config = {
  portalId: '',
  // formatTraits: (key, value) => {}
}

/**
 * HubSpot Analytics plugin
 * @link https://developers.hubspot.com/docs/methods/tracking_code_api/tracking_code_overview
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.portalId - The HubSpot Portal (or Hub) Id of your HubSpot account
 * @return {object} Analytics plugin
 * @example
 *
 * hubSpotPlugin({
 *   portalId: '234576'
 * })
 */
export default function hubSpotPlugin(pluginConfig = {}) {
  // Because hubspot automatically fired a page view onLoad. We need to ignore the first .page() call
  let initialPageViewFired = false
  // Allow for userland overides of base methods
  return {
    NAMESPACE: 'hubspot',
    config: {
      ...config,
      ...pluginConfig
    },
    initialize: ({ config }) => {
      const { portalId } = config
      if (!portalId) {
        throw new Error('No hubspot portalId defined')
      }

      // NoOp if hubspot already loaded by external source
      if (scriptAlreadyLoaded()) return

      const protocol = document.location.protocol
      const https = protocol === 'https:' || protocol === 'chrome-extension:'
      const bustCache = Math.floor(new Date().getTime() / 3600000)
      const prefix = (https) ? 'https:' : 'http:'
      const src = `${prefix}//js.hs-scripts.com/${portalId}.js?${bustCache}`

      // Create script & append to DOM
      let script = document.createElement('script')
      script.id = 'hs-script-loader'
      script.type = 'text/javascript'
      script.async = true
      // script.defer = defer
      script.src = src

      // On next tick, inject the script
      setTimeout(() => {
        let firstScript = document.getElementsByTagName('script')[0]
        firstScript.parentNode.insertBefore(script, firstScript)
      }, 0)
    },
    // https://developers.hubspot.com/docs/methods/tracking_code_api/identify_visitor
    identify: ({ payload, config }) => {
      const { userId, traits } = payload
      if (typeof _hsq === 'undefined') return false
      if (!traits.email) return false
      /* send hubspot identify call */
      const properties = formatTraits(traits, userId, defaultFormatter)
      _hsq.push(['identify', properties])
    },
    /* https://developers.hubspot.com/docs/methods/tracking_code_api/track_page_view */
    page: ({ payload, options, instance }) => {
      if (typeof _hsq === 'undefined') return false
      /* ignore the first .page() call b/c hubspot tracking script already fired it */
      if (!initialPageViewFired) {
        initialPageViewFired = true
        return
      }
      // Set page path
      _hsq.push(['setPath', payload.properties.path])
      _hsq.push(['trackPageView'])
    },
    /* https://developers.hubspot.com/docs/methods/tracking_code_api/javascript_events_api */
    track: ({ payload, options, config }) => {
      if (typeof _hsq === 'undefined') return false
      const formattedProperties = Object.assign({}, payload.properties, {
        id: payload.event
      })
      _hsq.push(['trackEvent', formattedProperties])
    },
    loaded: () => {
      return !!(window._hsq && window._hsq.push !== Array.prototype.push)
    },
  }
}

// Todo expose as option if needed
function defaultFormatter(key, value) {
  // Remove line breaks, tabs, spaces, .
  const validKey = replaceInvalid(key)
  // snake_case values
  const formattedKey = snakeCase(validKey)
  // special case for firstName & lastName
  if (formattedKey === 'first_name' || formattedKey === 'last_name') {
    return [ formattedKey.replace(/_/, ''), value ]
  }
  return [ formattedKey, value ]
}

function formatTraits(traits, userId, formatter) {
  const updatedTraits = Object.keys(traits).reduce((acc, traitName) => {
    // Automatically turn traitName into trait_name
    const [ key, value ] = formatter(traitName, traits[traitName])
    acc[key] = value
    return acc
  }, {})

  if (userId && !updatedTraits.id) {
    updatedTraits.id = userId
  }

  return updatedTraits
}

function replaceInvalid(str) {
  return str
    .split(' ').join('_') // spaces
    .split('.').join('_') // Periods
    .split('\n').join('_') // new lines
    .split('\v').join('_') // Vertical tabs
    .split('\t').join('_') // Regular tabs
    .split('\f').join('_') // form feeds
    .split('\r').join('_')
}

function snakeCase(str) {
  return str.split(/(?=[A-Z])/).join('_').toLowerCase()
}

function scriptAlreadyLoaded() {
  const scripts = document.getElementsByTagName('script')
  return !!Object.keys(scripts).filter((key) => {
    const { src } = scripts[key]
    return src.match(/js\.hs-scripts\.com/)
  }).length
}
