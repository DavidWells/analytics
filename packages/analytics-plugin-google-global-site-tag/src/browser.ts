import { AnalyticsInstance } from "analytics";

/* global, window */
enum PropertyScope {
  Global = 'global',
  Page = 'page',
}

interface ICookieConfig {
  cookie_expires?: number,
  cookie_prefix?: string,
  cookie_update?: boolean,
  cookie_flags?: string,
}

interface ILinkerConfig {
  domains?: string[],
  accept_incoming?: boolean,
}

interface IPluginConfig {
  trackingId?: string,
  anonymizeIp?: boolean,
  instanceName?: string,
  customScriptSrc?: string,
  domain?: string,
  cookieConfig?: ICookieConfig,
  linker?: ILinkerConfig,
  sendPageView?: boolean,
  customDimensions?: { [key: string]: unknown },
  resetCustomDimensionsOnPage?: string[],
  /**
   * `gtag.js` has three levels of property scopes. See:
   * https://developers.google.com/gtagjs/reference/api#parameter_scope
   * If `setCustomDimensionsToPage` is set true, `custom_dimensions`
   * would be set with the `config` method.
   */
  setCustomDimensionsToPage?: boolean,
  allowGoogleSignals?: boolean,
  allowAdPersonalizationSignals?: boolean,
}

interface IPluginApiProps {
  instance: AnalyticsInstance,
  config: IPluginConfig,
}

interface IPayload {
  userId: string,
  traits: { [key: string]: unknown },
  properties: ITrackProps & IPageProps & { [key: string]: unknown },
  event: string,
}

interface ITrackProps {
  label?: string, 
  value?: number, 
  category?: string, 
  nonInteraction?: boolean,
}

interface IPageProps {
  path?: string,
  title?: string,
  url?: string,
  referrer?: string,
}

interface IProps {
  payload: IPayload,
  config: IPluginConfig,
  instance: AnalyticsInstance,
}

interface ITrackEventProps {
  event: string,
  label?: string,
  category: string,
  value?: number,
  nonInteraction?: boolean,
  campaign?: ICampaignDataProps,
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: ReturnType<typeof setUpWindowGtag>;
  }
}

const defaultConfig = {
  sendPageView: true,
  customDimensions: {},
  anonymizeIp: false,
  allowGoogleSignals: true,
  allowAdPersonalizationSignals: true,
}

let loadedInstances: { [key: string]: boolean } = {};

const googleGtagAnalytics = (pluginConfig: IPluginConfig = {}) => {
  let pageCalledOnce = false
  // Allow for multiple google analytics instances
  const instanceName = pluginConfig.instanceName ? pluginConfig.instanceName : '';

  const trackingId = pluginConfig.trackingId;

  return {
    name: 'google-gtag-analytics',
    config: {
      ...defaultConfig,
      ...pluginConfig
    },
    
    // Load gtag.js and define gtag
    // Set parameter scope at user level with 'set' method
    initialize: (pluginApi: IPluginApiProps) => {
      const { config, instance } = pluginApi;
      if (!trackingId) throw new Error('No GA trackingId defined');

      const gtagScriptSource = 'https://www.googletagmanager.com/gtag/js';
      const scriptSrc = config.customScriptSrc || `${gtagScriptSource}?id=${trackingId}`;

      if (!gtagLoaded(config.customScriptSrc || gtagScriptSource)) {
        injectScript(scriptSrc);
      }

      if (!window.gtag) {
        setUpWindowGtag();
      }

      const customDimensions = formatCustomDimensionsIntoCustomMap(config);

      /**
       * Convert keys to snake cases, because Gtag config object's keys use
       * snake case instead of camel case. 
       */
      let newCookieConfig: { [key: string]: unknown} = {};
      if (config.cookieConfig !== undefined) {
        Object.entries(config.cookieConfig).forEach(([key, value]) => {
          newCookieConfig[camelToSnakeCase(key)] = value;
        })
      }

      // Initialize tracker instance on page
      if (!loadedInstances[instanceName]) {
        let gtagConfig: { [key: string]: unknown } = {
          cookie_domain: config.domain || 'auto',
          send_page_view: config.sendPageView ? config.sendPageView : true,
          allow_google_signals: config.allowGoogleSignals,
          allow_ad_personalization_signals: config.allowAdPersonalizationSignals,
          custom_map: customDimensions,
          anonymize_ip: config.anonymizeIp,
          ...newCookieConfig,
        }

        if (config.linker) {
          gtagConfig.linker = config.linker;
        }

        /* set custom dimensions from user traits */
        const user = instance.user() || {}
        const traits = user.traits || {}

        if (Object.keys(traits).length) {
          window.gtag('set', traits);
        }

        window.gtag('config', trackingId, gtagConfig);

        loadedInstances[instanceName] = true;
      }
    },

    // Set parameter scope at user level with 'set' method
    identify: (props: IProps) => {
      const { payload, config } = props;
      identifyVisitor(payload.userId, payload.traits, config)
    },

    // Set parameter scope at page level with 'config' method
    page: ({ payload, config, instance }: IProps) => {
      if (!window.gtag || !config.trackingId) return;

      const { properties } = payload;
      const { resetCustomDimensionsOnPage, customDimensions } = config;
      const campaign = instance.getState('context.campaign');

      /* If dimensions are specified to reset, clear them before page view */
      if (resetCustomDimensionsOnPage && resetCustomDimensionsOnPage.length && customDimensions) {
        const resetDimensions = resetCustomDimensionsOnPage.reduce((acc: { [key: string]: unknown }, key: string) => {
          if (customDimensions[key]) {
            acc[key] = null // { 'dimension_name': null } etc
          }
          return acc
        }, {})

        if (Object.keys(resetDimensions).length) {
          // Reset custom dimensions
          window.gtag('set', resetDimensions);
        }
      }

      /* Set dimensions or return them for `config` if config.setCustomDimensionsToPage is false */
      const customDimensionValues = setCustomDimensions(properties, config);

      /**
       * Create pageview-related properties
       */
      const path = properties.path || document.location.pathname;
      const pageView = {
        page_path: path,
        page_title: properties.title,
        page_location: properties.url,
        // allow referrer override if referrer was manually set
        referrer: properties.referrer !== document.referrer ? properties.referrer : undefined,
      }

      /**
       * Create user properties for `config` method that are not part of custom dimensions
       */
      const pageRelatedProperties = ['title', 'url', 'path', 'sendPageView', 'referrer'];
      const customDimensionKeys = (customDimensions && Object.keys(customDimensions)) || [];
      const otherProperties = Object.keys(properties).reduce((acc: { [key: string]: unknown }, key: string) => {
        if (!pageRelatedProperties.includes(key) && !customDimensionKeys.includes(key)) {
          acc[key] = properties[key];
        }
        return acc;
      }, {});

      const campaignData = addCampaignData(campaign);
      const convertedCustomDimensions = formatCustomDimensionsIntoCustomMap(config);

      /* Dimensions will only be included in the event if config.setCustomDimensionsToPage is false */
      window.gtag('config', config.trackingId, {
        // Every time a `pageview` is sent, we need to pass custom_map again into the configuration
        custom_map: convertedCustomDimensions,
        send_page_view: config.sendPageView || true,
        ...customDimensionValues,
        ...otherProperties,
      });

      const finalPayload = {
        send_to: config.trackingId,
        ...pageView,
        ...campaignData,
      }

      // Remove location for SPA tracking after initial page view
      if (pageCalledOnce) {
        delete finalPayload.page_location
      }

      window.gtag('event', 'page_view', finalPayload);

      // Set after initial page view
      pageCalledOnce = true
    },

    loaded: () => {
      return Boolean(window.gtag);
    },

    // Set parameter scope at event level with 'event' method
    track: ({ payload, config, instance}: IProps) => {
      const { properties, event } = payload;
      const { label, value, category, nonInteraction } = properties;
      const campaign = instance.getState('context.campaign');

      trackEvent({
        event,
        label,
        category: category || 'All',
        value,
        nonInteraction,
        campaign,
      }, config, payload);
    },
  }
}

const trackEvent = (eventData: ITrackEventProps, config: IPluginConfig = {}, payload: IPayload) => {
  if (!window.gtag || !config.trackingId) return;

  /* Set Dimensions or return them for payload if config.setCustomDimensionsToPage is false */
  const customDimensionValues = setCustomDimensions(payload.properties, config);

  const convertedCustomDimensions = formatCustomDimensionsIntoCustomMap(config);
  /**
   * You have to re`config` custom_map for events if new values are `set` for a user
   */
  window.gtag('config', config.trackingId, {
    send_page_view: config.sendPageView || true,
    custom_map: convertedCustomDimensions,
  });

  /**
   * Create event-related properties
   */
  const data: { [key: string]: unknown } = {
    event_label: eventData.label,
    event_category: eventData.category || 'All',
    non_interaction: (eventData.nonInteraction !== undefined) ? Boolean(eventData.nonInteraction) : false,
  }

  if (eventData.value) {
    /* set value of the action */
    data.value = eventData.value >= 0 ? eventData.value : 0;
  }

  /* Attach campaign data */
  const campaignData = addCampaignData(eventData.campaign);

  /**
   * Create user properties for `config` method that are not part of custom dimensions
   */
  const pageRelatedProperties = ['label', 'category', 'nonInteraction', 'value'];
  const customDimensionKeys = (config.customDimensions && Object.keys(config.customDimensions)) || [];
  const otherProperties = Object.keys(payload.properties).reduce((acc: { [key: string]: unknown }, key: string) => {
    if (!pageRelatedProperties.includes(key) && !customDimensionKeys.includes(key)) {
      acc[key] = payload.properties[key];
    }
    return acc;
  }, {});

  const finalPayload = {
    ...otherProperties,
    ...data,
    /* Attach campaign data, if exists */
    ...campaignData,
    /* Dimensions will only be included in the event if config.setCustomDimensionsToPage is false */
    ...customDimensionValues
  };

  /* Send data to Google Analytics */
  window.gtag('event', eventData.event, finalPayload);
  return finalPayload;
}

const camelToSnakeCase = (key: string) => key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const get = (obj: { [key: string]: unknown }, key: string) => {
  const keys = key.split ? key.split('.') : key;
  let object = undefined;
  for (let p = 0; p < keys.length; p++) {
    object = obj ? obj[keys[p]] : undefined;
  }
  return object;
}

interface ICampaignDataProps {
  name?: string,
  source?: string,
  medium?: string,
  content?: string,
  keyword?: string,
}

interface ICampaign {
  campaignName?: string,
  campaignSource?: string,
  campaignMedium?: string,
  campaignContent?: string,
  campaignKeyword?: string,
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
function addCampaignData(campaignData: ICampaignDataProps = {}) {
  let campaign: ICampaign = {};
  const { name, source, medium, content, keyword } = campaignData;
  if (name) campaign.campaignName = name;
  if (source) campaign.campaignSource = source;
  if (medium) campaign.campaignMedium = medium;
  if (content) campaign.campaignContent = content;
  if (keyword) campaign.campaignKeyword = keyword;
  return campaign;
}

/**
 * Changes format of custom dimensions from:
 * { traitOne: 'dimension1', traitTwo: 'dimension2' }
 * to:
 * { dimension1: traitOne, dimension2: traitTwo }
 */
const formatCustomDimensionsIntoCustomMap = (plugin: IPluginConfig) => {
  const { customDimensions } = plugin;
  return customDimensions && Object.entries(customDimensions as { [key: string]: string }).reduce((acc: { [key: string]: string }, entry: [string, string]) => {
    const [key, value] = entry;
    acc[value] = key;
    return acc;
  }, {});
}

// from props pick out the keys that exist in config.customDimensions
const setCustomDimensions = (properties: { [key: string]: unknown } = {}, config: IPluginConfig) => {
  const { customDimensions } = config;
  if (!customDimensions) return {};

  const customDimensionsValue = Object.keys(customDimensions as { [key: string]: string }).reduce((acc: { [key: string]: unknown }, key: string) => {
    let value = get(properties, key) || properties[key];
    if (typeof value === 'boolean') {
      value = value.toString()
    }
    if (value || value === 0) {
      acc[key] = value
      return acc
    }
    return acc
  }, {});

  if (!Object.keys(customDimensionsValue).length) return {};

  if (!config.setCustomDimensionsToPage) {
    return customDimensionsValue;
  }

  window.gtag('set', customDimensionsValue);
  return {};
}

export const identifyVisitor = (
  id: string | undefined,
  traits: { [key: string]: unknown } = {},
  config: IPluginConfig = {},
) => {
  const trackingId = config.trackingId;
  if (!window.gtag || !trackingId) return;
  
  if (id) {
    window.gtag('set', { user_id: id });
  }

  if (Object.keys(traits).length) {
    window.gtag('set', traits);
  }
}

const gtagLoaded = (scriptSrc: string) => {
  return scriptLoaded(scriptSrc)
}

const scriptLoaded = (scriptSrc: string) => {
  const scripts = document.querySelectorAll('script[src]') as NodeListOf<HTMLScriptElement>;
  const regex = new RegExp(`^${scriptSrc}`);
  return Boolean(Object.values(scripts).filter(
    (value) => regex.test(value.src)
  ).length);
}

const injectScript = (scriptSrc: string) => {
  const script = document.createElement('script');
  script.async = true;
  script.src = scriptSrc;
  document.body.appendChild(script);
  return script;
};

const setUpWindowGtag = () => {
  window.dataLayer = window.dataLayer || [];

  function gtagHelper(method: 'js', date: Date): void;
  function gtagHelper(method: 'set', data: { [key: string]: unknown }): void;
  function gtagHelper(
    method: 'config' | 'event',
    data: string,
    config?: { [key: string]: unknown }
  ): void;
  function gtagHelper() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  }

  gtagHelper('js', new Date());

  window.gtag = gtagHelper;
  return gtagHelper;
};

export {};

export default googleGtagAnalytics;
