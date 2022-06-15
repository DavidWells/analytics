/* global, window */
const defaultConfig = {
  sendPageView: true,
  customDimensions: {},
  anonymizeIp: false,
  allowGoogleSignals: true,
  allowAdPersonalizationSignals: true,
}

let loadedInstances = {}

function googleGtagAnalytics(pluginConfig = {}) {
  let pageCalledOnce = false
  // Allow for multiple google analytics instances
  const instanceName = pluginConfig.instanceName ? pluginConfig.instanceName : ''
  const trackingId = pluginConfig.trackingId
  return {
    name: 'google-gtag-analytics',
    config: Object.assign(defaultConfig, pluginConfig),
    // Load gtag.js and define gtag
    // Set custom dimensions (ua properties) and parameters (ga4 properties)
    initialize: (pluginApi) => {
      const { config, instance } = pluginApi
      if (!trackingId) throw new Error('No GA trackingId defined')
      const gtagScriptSource = 'https://www.googletagmanager.com/gtag/js'
      const scriptSrc = config.customScriptSrc || `${gtagScriptSource}?id=${trackingId}`
      if (!gtagLoaded(config.customScriptSrc || gtagScriptSource)) {
        injectScript(scriptSrc)
      }
      if (!window.gtag) {
        setUpWindowGtag()
      }
      /**
       * Covert custom dimensions to:
       * { dimension1: traitOne, dimension2: traitTwo }
       */
      const customDimensions = formatCustomDimensionsIntoCustomMap(config)
      /**
       * Convert `cookieConfig`'s keys from camel case to snake cases
       */
      let newCookieConfig = {}
      if (config.cookieConfig !== undefined) {
        Object.entries(config.cookieConfig).forEach(([key, value]) => {
          newCookieConfig[camelToSnakeCase(key)] = value
        })
      }
      // Initialize tracker instance on page
      if (!loadedInstances[instanceName]) {
        let gtagConfig = Object.assign(
          {
            cookie_domain: config.domain || 'auto',
            send_page_view: config.sendPageView ? config.sendPageView : true,
            allow_google_signals: config.allowGoogleSignals,
            allow_ad_personalization_signals: config.allowAdPersonalizationSignals,
            custom_map: customDimensions,
            anonymize_ip: config.anonymizeIp,
          },
          newCookieConfig
        )
        if (config.linker) {
          gtagConfig.linker = config.linker
        }
        /* set custom dimensions from user traits */
        const user = instance.user() || {}
        const traits = user.traits || {}
        if (Object.keys(traits).length) {
          window.gtag('set', traits)
        }
        window.gtag('config', trackingId, gtagConfig)
        loadedInstances[instanceName] = true
      }
    },
    // Set parameter scope at user level with 'set' method
    identify: (props) => {
      const { payload, config } = props
      identifyVisitor(payload.userId, payload.traits, config)
    },
    // Set parameter scope at page level with 'config' method
    page: ({ payload, config, instance }) => {
      if (!window.gtag || !config.trackingId) return
      const { properties } = payload
      const { resetCustomDimensionsOnPage, customDimensions } = config
      const campaign = instance.getState('context.campaign')
      /* If dimensions are specified to reset, clear them before page view */
      if (resetCustomDimensionsOnPage && resetCustomDimensionsOnPage.length && customDimensions) {
        const resetDimensions = resetCustomDimensionsOnPage.reduce((acc, key) => {
          if (customDimensions[key]) {
            acc[key] = null // { 'dimension_name': null } etc
          }
          return acc
        }, {})
        if (Object.keys(resetDimensions).length) {
          // Reset custom dimensions
          window.gtag('set', resetDimensions)
        }
      }
      /**
       * Create pageview-related properties
       */
      const path = properties.path || document.location.pathname
      const pageView = {
        page_path: path,
        page_title: properties.title,
        page_location: properties.url,
      }
      const campaignData = addCampaignData(campaign)
      /**
       * Creates property dimensions for global scope
       */
      const globalProperties = getProperties(properties, config.globalProperties)
      const pageData = Object.assign(
        {
          page: path,
          title: properties.title,
          // allow referrer override if referrer was manually set
          referrer: properties.referrer !== document.referrer ? properties.referrer : undefined,
        },
        globalProperties
      )
      window.gtag('set', pageData)
      /* Set dimensions or return them for `config` if config.setCustomDimensionsToPage is false */
      const customDimensionValues = setCustomDimensions(properties, config)
      /**
       * Creates property dimensions for user scope
       */
      const userProperties = getProperties(properties, config.userProperties)
      const convertedCustomDimensions = formatCustomDimensionsIntoCustomMap(config)
      /* Dimensions will only be included in the event if config.setCustomDimensionsToPage is false */
      window.gtag(
        'config',
        config.trackingId,
        Object.assign(
          {
            // Every time a `pageview` is sent, we need to pass custom_map again into the configuration
            custom_map: convertedCustomDimensions,
            send_page_view: config.sendPageView || true,
          },
          userProperties
        )
      )
      /**
       * Create user properties for `config` method that are not part of custom dimensions
       */
      const pageRelatedProperties = ['title', 'url', 'path', 'sendPageView', 'referrer']
      const customDimensionKeys = (customDimensions && Object.keys(customDimensions)) || []
      const selfDefinedPageProperties = Object.keys(properties).reduce((acc, key) => {
        if (
          !pageRelatedProperties.includes(key) &&
          !customDimensionKeys.includes(key) &&
          !(config.globalProperties && config.globalProperties.includes(key)) &&
          !(config.userProperties && config.userProperties.includes(key))
        ) {
          acc[key] = properties[key]
        }
        return acc
      }, {})
      /* Dimensions will only be included in the event if config.setCustomDimensionsToPage is false */
      const finalPayload = Object.assign(
        Object.assign(
          Object.assign(
            Object.assign(Object.assign({ send_to: config.trackingId }, pageView), campaignData),
            customDimensionValues
          ),
          pageRelatedProperties
        ),
        selfDefinedPageProperties
      )
      // Remove location for SPA tracking after initial page view
      if (pageCalledOnce) {
        delete finalPayload.page_location
      }
      window.gtag('event', 'page_view', finalPayload)
      // Set after initial page view
      pageCalledOnce = true
    },
    loaded: () => {
      return Boolean(window.gtag)
    },
    // Set parameter scope at event level with 'event' method
    track: ({ payload, config, instance }) => {
      const { properties, event } = payload
      const { label, value, category, nonInteraction } = properties
      const campaign = instance.getState('context.campaign')
      trackEvent(
        {
          event,
          label,
          category: category || 'All',
          value,
          nonInteraction,
          campaign,
        },
        config,
        payload
      )
    },
  }
}
const trackEvent = (eventData, config = {}, payload) => {
  if (!window.gtag || !config.trackingId) return
  /* Set Dimensions or return them for payload if config.setCustomDimensionsToPage is false */
  const customDimensionValues = setCustomDimensions(payload.properties, config)
  const convertedCustomDimensions = formatCustomDimensionsIntoCustomMap(config)
  /**
   * You have to re`config` custom_map for events if new values are `set` for a user
   */
  window.gtag('config', config.trackingId, {
    send_page_view: config.sendPageView || true,
    custom_map: convertedCustomDimensions,
  })
  /**
   * Create event-related properties
   */
  // Limits https://support.google.com/analytics/answer/9267744
  const data = {
    event_label: eventData.label,
    event_category: eventData.category || 'All',
    non_interaction: eventData.nonInteraction !== undefined ? Boolean(eventData.nonInteraction) : false,
  }
  if (eventData.value) {
    /* set value of the action */
    data.value = eventData.value >= 0 ? eventData.value : 0
  }
  /* Attach campaign data */
  const campaignData = addCampaignData(eventData.campaign)
  /**
   * Creates self-defined event property values
   */
  const gaEventProperties = ['label', 'category', 'nonInteraction', 'value']
  const selfDefinedEventProperties = Object.keys(payload.properties).reduce((acc, key) => {
    if (!gaEventProperties.includes(key)) {
      acc[key] = payload.properties[key]
    }
    return acc
  }, {})
  const finalPayload = Object.assign(
    Object.assign(Object.assign(Object.assign({}, data), campaignData), customDimensionValues),
    selfDefinedEventProperties
  )
  /* Send data to Google Analytics */
  /* Signature
    gtag('event', '<event_name>', {
      <event_params>
    })
  */
  window.gtag('event', eventData.event, finalPayload)
  return finalPayload
}

const camelToSnakeCase = (key) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

const get = (obj, key) => {
  const keys = key.split ? key.split('.') : key
  let object = undefined
  for (let p = 0; p < keys.length; p++) {
    object = obj ? obj[keys[p]] : undefined
  }
  return object
}

/**
 * Add campaign data to GA payload https://bit.ly/34qFCPn
 * @param {Object} [campaignData={}] [description]
 * @param {String} [campaignData.campaignName] - Name of campaign
 * @param {String} [campaignData.campaignSource] - Source of campaign
 * @param {String} [campaignData.campaignMedium] - Medium of campaign
 * @param {String} [campaignData.campaignContent] - Content of campaign
 * @param {String} [campaignData.campaignKeyword] - Keyword of campaign
 */
function addCampaignData(campaignData = {}) {
  let campaign = {}
  const { name, source, medium, content, keyword } = campaignData
  if (name) campaign.campaignName = name
  if (source) campaign.campaignSource = source
  if (medium) campaign.campaignMedium = medium
  if (content) campaign.campaignContent = content
  if (keyword) campaign.campaignKeyword = keyword
  return campaign
}
/**
 * Changes format of custom dimensions from:
 * { traitOne: 'dimension1', traitTwo: 'dimension2' }
 * to:
 * { dimension1: traitOne, dimension2: traitTwo }
 */
function formatCustomDimensionsIntoCustomMap(plugin) {
  const { customDimensions } = plugin
  return (
    customDimensions &&
    Object.entries(customDimensions).reduce((acc, entry) => {
      const [key, value] = entry
      acc[value] = key
      return acc
    }, {})
  )
}
/**
 * Create parameter value object based on given key values.
 * */
function getProperties(properties = {}, propertyKeys = []) {
  return propertyKeys.reduce((acc, key) => {
    if (properties[key]) {
      acc[key] = properties[key]
    }
    return acc
  }, {})
}
/**
 * Create custom dimension value object with keys that exist in
 * config.customDimensions. If `config.setCustomDimensionsToPage`
 * is true, set custom dimension values with the `set` command.
 * Otherwise, return object for `config`.
 * */
function setCustomDimensions(properties = {}, config) {
  const { customDimensions } = config
  if (!customDimensions) return {}
  const customDimensionsValue = Object.keys(customDimensions).reduce((acc, key) => {
    let value = get(properties, key) || properties[key]
    if (typeof value === 'boolean') {
      value = value.toString()
    }
    if (value || value === 0) {
      acc[key] = value
      return acc
    }
    return acc
  }, {})
  if (!Object.keys(customDimensionsValue).length) return {}
  if (!config.setCustomDimensionsToPage) {
    return customDimensionsValue
  }
  window.gtag('set', customDimensionsValue)
  return {}
}

export function identifyVisitor (id, traits = {}, config = {}) {
  const trackingId = config.trackingId
  if (!window.gtag || !trackingId) return
  if (id) {
    window.gtag('set', { user_id: id })
  }
  if (Object.keys(traits).length) {
    window.gtag('set', traits)
  }
}

function gtagLoaded(scriptSrc) {
  return scriptLoaded(scriptSrc)
}

function scriptLoaded(scriptSrc) {
  const scripts = document.querySelectorAll('script[src]')
  const regex = new RegExp(`^${scriptSrc}`)
  return Boolean(Object.values(scripts).filter((value) => regex.test(value.src)).length)
}

function injectScript(scriptSrc) {
  const script = document.createElement('script')
  script.async = true
  script.src = scriptSrc
  document.body.appendChild(script)
  return script
}

function setUpWindowGtag() {
  window.dataLayer = window.dataLayer || []
  function gtagHelper() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  gtagHelper('js', new Date())
  window.gtag = gtagHelper
  return gtagHelper
}

export default googleGtagAnalytics
