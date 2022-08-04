/* global, window */
let loadedInstances = {}
/* Location of gtag script */
const gtagScriptSource = 'https://www.googletagmanager.com/gtag/js'
// See https://developers.google.com/analytics/devguides/collection/ga4/reference/config
const defaultGtagConf = {
  // https://support.google.com/analytics/answer/7201382?hl=en#zippy=%2Cglobal-site-tag-websites
  debug_mode: false,
  /**
   * Disable automatic sending of page views, instead let analytics.page() do this
   * https://developers.google.com/analytics/devguides/collection/gtagjs
   */
  send_page_view: false,
  // https://developers.google.com/analytics/devguides/collection/gtagjs/ip-anonymization
  anonymize_ip: false,
  /**
   * Disable All Advertising
   * https://developers.google.com/analytics/devguides/collection/ga4/display-features#disable_all_advertising_features
   */
  allow_google_signals: true,
  /**
   * Disable Advertising Personalization
   * https://developers.google.com/analytics/devguides/collection/ga4/display-features#disable_advertising_personalization
   */
  allow_ad_personalization_signals: true,
  /**
   * https://developers.google.com/analytics/devguides/collection/gtagjs/cookies-user-id#configure_cookie_field_settings
   */
  // cookie_domain: 'auto',
  // cookie_expires
  // cookie_prefix
  // cookie_update
  // cookie_flags
  /**
   * Cookie Flags
   * https://developers.google.com/analytics/devguides/collection/ga4/cookies-user-id#cookie_flags
   */
  cookie_flags: '',
}

const defaultConfig = {
  gtagName: 'gtag',
  dataLayerName: 'ga4DataLayer',
  measurementIds: [],
  gtagConfig: defaultGtagConf,
}

/**
 * Google analytics plugin
 * @link https://getanalytics.io/plugins/google-analytics/
 * @link https://analytics.google.com/analytics/web/
 * @link https://developers.google.com/analytics/devguides/collection/analyticsjs
 * @param {object}  pluginConfig - Plugin settings
 * @param {string|array} pluginConfig.measurementIds - Google Analytics MEASUREMENT IDs
 * @param {boolean} [pluginConfig.debug] - Enable Google Analytics debug mode
 * @param {string}  [pluginConfig.dataLayerName=ga4DataLayer] - The optional name for dataLayer object. Defaults to ga4DataLayer.
 * @param {string}  [pluginConfig.gtagName=gtag] - The optional name for dataLayer object. Defaults to ga4DataLayer.
 * @param {boolean} [pluginConfig.gtagConfig.anonymize_ip] - Enable [Anonymizing IP addresses](https://bit.ly/3c660Rd) sent to Google Analytics.
 * @param {object}  [pluginConfig.gtagConfig.cookie_domain] - Additional cookie properties for configuring the [ga cookie](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#configuring_cookie_field_settings)
 * @param {object}  [pluginConfig.gtagConfig.cookie_expires] - Additional cookie properties for configuring the [ga cookie](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#configuring_cookie_field_settings)
 * @param {object}  [pluginConfig.gtagConfig.cookie_prefix] - Additional cookie properties for configuring the [ga cookie](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#configuring_cookie_field_settings)
 * @param {object}  [pluginConfig.gtagConfig.cookie_update] - Additional cookie properties for configuring the [ga cookie](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#configuring_cookie_field_settings)
 * @param {object}  [pluginConfig.gtagConfig.cookie_flags] - Additional cookie properties for configuring the [ga cookie](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#configuring_cookie_field_settings)
 * @param {string}  [pluginConfig.customScriptSrc] - Custom URL for google analytics script, if proxying calls
 * @return {*}
 * @example
 *
 * googleAnalytics({
 *   measurementIds: ['UA-1234567']
 * })
 */
function googleAnalytics(pluginConfig = {}) {
  let pageCallCount = 0
  let measurementIds = getIds(pluginConfig.measurementIds)
  const initConfig = {
    ...defaultConfig,
    ...pluginConfig,
  }

  return {
    name: 'google-analytics',
    config: initConfig,
    // Load gtag.js and define gtag
    initialize: ({ config, instance }) => {
      const { dataLayerName, customScriptSrc, gtagName, gtagConfig, debug } = config
      /* Inject google gtag.js script if not found */
      if (!scriptLoaded(customScriptSrc || gtagScriptSource)) {
        const customLayerName = dataLayerName ? `&l=${dataLayerName}` : ''
        const script = document.createElement('script')
        script.async = true
        script.src = customScriptSrc || `${gtagScriptSource}?id=${measurementIds[0]}${customLayerName}`
        document.body.appendChild(script)
      }
      /* Set gtag and datalayer */
      if (!window[dataLayerName]) {
        window[dataLayerName] = window[dataLayerName] || []
        window[gtagName] = function () {
          window[dataLayerName].push(arguments)
        }
        window[gtagName]('js', new Date())
      }
      // Initialize tracker instances on page
      let gtagConf = {
        ...defaultGtagConf,
        ...(gtagConfig ? gtagConfig : {}),
      }
      // You must explicitly delete the debug_mode parameter or all sessions will fire in debug more. Setting it false is not enough.
      // https://support.google.com/analytics/answer/7201382?hl=en&ref_topic=9303319#zippy=%2Cgoogle-tag-websites:~:text=To%20disable%20debug%20mode%2C%20exclude%20the%20%27debug_mode%27%20parameter%3B%20setting%20the%20parameter%20to%20false%20doesn%27t%20disable%20debug%20mode.
      if (debug === true) {
        gtagConf.debug_mode = true
      } else {
        delete gtagConf.debug_mode
      }
      /* set custom dimensions from user traits */
      const user = instance.user() || {}
      const traits = user.traits || {}
      if (Object.keys(traits).length) {
        window[gtagName]('set', 'user_properties', traits)
      }
      /* Initialize all measurementIds */
      for (var i = 0; i < measurementIds.length; i++) {
        if (!loadedInstances[measurementIds[i]]) {
          window[gtagName]('config', measurementIds[i], gtagConf)
          loadedInstances[measurementIds[i]] = true
        }
      }
    },
    // Set parameter scope at user level with 'set' method
    identify: ({ payload, config }) => {
      const { gtagName } = config
      if (!window[gtagName] || !measurementIds.length) return
      if (payload.userId) {
        // https://developers.google.com/analytics/devguides/collection/ga4/user-id?platform=websites#send_user_ids
        window[gtagName]('set', { user_id: payload.userId })
        // console.log('Set userid', payload.userId)
      }
      // TODO verify this
      // https://developers.google.com/analytics/devguides/collection/ga4/user-properties?technology=websites
      if (Object.keys(payload.traits).length) {
        /* gtag('set', 'user_properties', {
          favorite_composer: 'Mahler',
          favorite_instrument: 'double bass',
          season_ticketholder: 'true'
        }) */
        window[gtagName]('set', 'user_properties', payload.traits)
        // console.log('Set userprops', payload.traits)
      }
    },
    // Set parameter scope at page level with 'config' method
    page: ({ payload, config, instance }) => {
      const { gtagName, gtagConfig } = config
      if (!window[gtagName] || !measurementIds.length) return
      const { properties } = payload
      const { send_to } = properties
      const campaign = instance.getState('context.campaign')
      // console.log('ga page properties', properties)
      /* Create pageview-related properties */
      const pageView = {
        page_title: properties.title,
        page_location: properties.url,
        page_path: properties.path || document.location.pathname,
        page_hash: properties.hash,
        page_search: properties.page_search,
        page_referrer: properties.referrer,
      }
      const campaignData = addCampaignData(campaign)
      const finalPayload = {
        ...(send_to ? { send_to } : {}),
        ...pageView,
        ...campaignData,
      }
      /* If send_page_view true, ignore first analytics.page call */
      if (gtagConfig && gtagConfig.send_page_view && pageCallCount === 0) {
        pageCallCount++
        // console.log('ignore first pageCallCount', pageCallCount)
        return
      }
      // console.log('Send page_view payload', finalPayload)
      window[gtagName]('event', 'page_view', finalPayload)
      // Set after initial page view
      pageCallCount++
    },
    // Set parameter scope at event level with 'event' method
    track: ({ payload, config, instance }) => {
      const { properties, event } = payload
      const campaign = instance.getState('context.campaign')
      const { gtagName } = config
      if (!window[gtagName] || !measurementIds.length) return
      /* Attach campaign data */
      const campaignData = addCampaignData(campaign)
      // Limits https://support.google.com/analytics/answer/9267744
      const finalPayload = {
        ...properties,
        /* Attach campaign data, if exists */
        ...campaignData,
      }
      /*
        console.log('finalPayload', finalPayload)
        console.log('event', event)
      */
      /* Send data to Google Analytics
        Signature gtag('event', '<event_name>', {
          <event_params>key: value,
        })
      */
      window[gtagName]('event', event, finalPayload)
    },
    /* Verify gtag loaded and ready to use */
    loaded: () => {
      const { dataLayerName, customScriptSrc } = initConfig
      const hasDataLayer =
        dataLayerName &&
        window[dataLayerName] &&
        Array.prototype.push === window[dataLayerName].push
      return scriptLoaded(customScriptSrc || gtagScriptSource) && hasDataLayer
    },
    /* Custom methods */
    methods: {
      addTag(tagId, settings = {}) {
        // https://developers.google.com/tag-platform/devguides/install-gtagjs#add_products_to_your_tag
        if (window[initConfig.gtagName]) {
          window[initConfig.gtagName]('config', tagId, settings)
          // Add tag id
          if (measurementIds && !measurementIds.includes(tagId)) {
            measurementIds = measurementIds.concat(tagId)
          }
        }
      },
      /* Disable gtag for user */
      disable: (ids) => {
        const gaIds = ids ? getIds(ids) : measurementIds
        for (var i = 0; i < measurementIds.length; i++) {
          const gaId = measurementIds[i]
          if (gaIds.includes(gaId)) {
            // https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out
            window[`ga-disable-${gaId}`] = true
          }
        }
      },
      /* Enable gtag for user */
      enable: (ids) => {
        const gaIds = ids ? getIds(ids) : measurementIds
        for (var i = 0; i < measurementIds.length; i++) {
          const gaId = measurementIds[i]
          if (gaIds.includes(gaId)) {
            // https://developers.google.com/analytics/devguides/collection/gtagjs/user-opt-out
            window[`ga-disable-${gaId}`] = false
          }
        }
      },
    },
  }
}

function getIds(measurementIds) {
  if (!measurementIds) throw new Error('No GA Measurement ID defined')
  if (Array.isArray(measurementIds)) {
    return measurementIds
  }
  if (typeof measurementIds === 'string') {
    return [measurementIds]
  }
  throw new Error('GA Measurement ID must be string or array of strings')
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
  const { id, name, source, medium, content, keyword } = campaignData
  if (id) campaign.campaignId = id
  if (name) campaign.campaignName = name
  if (source) campaign.campaignSource = source
  if (medium) campaign.campaignMedium = medium
  if (content) campaign.campaignContent = content
  if (keyword) campaign.campaignKeyword = keyword
  return campaign
}

function scriptLoaded(scriptSrc) {
  const scripts = document.querySelectorAll('script[src]')
  const regex = new RegExp(`^${scriptSrc}`)
  return Boolean(
    Object.values(scripts).filter((value) => regex.test(value.src)).length
  )
}

export default googleAnalytics
