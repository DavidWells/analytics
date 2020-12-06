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
  instanceName?: string,
  customScriptSrc?: string,
  domain?: string,
  cookieConfig?: ICookieConfig,
  linker?: ILinkerConfig,
  sendPageView?: boolean,
  customDimensions?: { [key: string]: unknown },
  resetCustomDimensionsOnPage?: string[],
  setCustomDimensionsToPage?: boolean,
}

interface IPluginApiProps {
  instance: AnalyticsInstance,
  config: IPluginConfig,
}

interface IIdentifyPayload {
  userId: string,
  traits: { [key: string]: unknown },
}

interface IIdentifyProps {
  payload: IIdentifyPayload,
  config: IPluginConfig,
}

interface IPageProps {
  payload: { [key: string]: any },
  config: IPluginConfig,
  instance: AnalyticsInstance,
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: ReturnType<typeof setUpWindowGtag>;
  }
}

const defaultConfig = {
  trackingId: null,
  sendPageView: true,
  customDimensions: {},
}

let loadedInstances: { [key: string]: boolean } = {};

const googleGtagAnalytics = (pluginConfig: IPluginConfig = {}) => {
  let pageCalledOnce = false
  // Allow for multiple google analytics instances
  const { instanceName } = getInstanceDetails(pluginConfig)

  const trackingId = pluginConfig.trackingId;

  return {
    name: 'googlt-gtag-analytics',
    config: {
      ...defaultConfig,
      ...pluginConfig
    },
    
    // Load gtag.js and define gtag
    initialize: (pluginApi: IPluginApiProps) => {
      const { config, instance } = pluginApi;
      if (!trackingId) throw new Error('No GA trackingId defined');

      const gtagScriptSource = 'https://www.googletagmanager.com/gtag/js';
      const scriptSrc = config.customScriptSrc || `${gtagScriptSource}?id=${trackingId}`;

      if (!gtagNotLoaded(config.customScriptSrc || gtagScriptSource)) {
        injectScript(scriptSrc);
      }

      if (!window.gtag) {
        setUpWindowGtag();
      }

      // Initialize tracker instance on page
      if (!loadedInstances[instanceName]) {
        let gtagConfig = {
          cookie_domain: config.domain || 'auto',
          send_page_view: config.sendPageView ? config.sendPageView : true,
          linker: config.linker ? config.linker : undefined,
          ...config.cookieConfig,
        }

        /* set custom dimensions from user traits */
        const user = instance.user() || {}
        const traits = user.traits || {}

        if (Object.keys(traits).length) {
          const customDimensions = formateCustomDimensionsIntoCustomMap(config);

          window.gtag('set', {
            custom_map: customDimensions,
            ...traits,
          });
        }

        window.gtag('config', trackingId, gtagConfig);
        loadedInstances[instanceName] = true
      }
    },

    identify: (props: IIdentifyProps) => {
      const { payload, config } = props;
      identifyVisitor(payload.userId, payload.traits, config)
    },

    page: ({ payload, config, instance }: IPageProps) => {
      const { properties } = payload;
      const { resetCustomDimensionsOnPage, customDimensions } = config;
      const campaign = instance.getState('context.campaign');

      if (!window.gtag || !config.trackingId) return;

      /* If dimensions are specifiied to reset, clear them before page view */
      if (resetCustomDimensionsOnPage && resetCustomDimensionsOnPage.length && customDimensions) {
        const resetDimensions = resetCustomDimensionsOnPage.reduce((acc, key) => {
          if (customDimensions[key]) {
            // @ts-ignore
            acc[key] = null // { 'dimension_name': null } etc
          }
          return acc
        }, {})

        if (Object.keys(resetDimensions).length) {
          window.gtag('set', resetDimensions);
        }
      }

      const path = properties.path || document.location.pathname;
      const pageView = {
        page_path: path,
        page_title: properties.title,
        page_location: properties.url,
        send_page_view: config.sendPageView || true,
      }

      let pageData: { [key: string]: unknown } = {
        page_path: path,
        page_title: properties.title,
        send_page_view: config.sendPageView || true,
      };

      // allow referrer override if referrer was manually set
      if (properties.referrer !== document.referrer) {
        pageData.referrer = properties.referrer;
      }

      window.gtag('set', pageData);

      const campaignData = addCampaignData(campaign);

      /* Set Dimensions or return them for payload is config.setCustomDimensionsToPage is false */
      const dimensions = setCustomDimensions(properties, config);

      /* Dimensions will only be included in the event if config.setCustomDimensionsToPage is false */
      const finalPayload = {
        send_to: config.trackingId,
        ...pageView,
        ...campaignData,
        ...dimensions
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
    }
  }
}

// from props pick out the keys that exist in config.customDimensions
const setCustomDimensions = (properties: { [key: string]: unknown } = {}, opts: IPluginConfig) => {
  const { customDimensions } = opts;
  if (!customDimensions) return {};

  const customDimensionsValue = Object.keys(customDimensions).reduce((acc, key) => {
    let value = get(properties, key) || properties[key];
    if (typeof value === 'boolean') {
      value = value.toString()
    }
    if (value || value === 0) {
      // @ts-ignore
      acc[key] = value
      return acc
    }
    return acc
  }, {});

  if (!Object.keys(customDimensionsValue).length) return {};

  if (!opts.setCustomDimensionsToPage) {
    return customDimensionsValue;
  }

  window.gtag('set', customDimensionsValue);
  return {};
}

function get(obj: { [key: string]: unknown }, key: string) {
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
const formateCustomDimensionsIntoCustomMap = (plugin: IPluginConfig) => {
  const { customDimensions } = plugin;
  return customDimensions && Object.entries(customDimensions).reduce((acc, entry) => {
    const [key, value] = entry;
    // @ts-ignore
    acc[value] = key;
    return acc;
  }, {});
}

export const identifyVisitor = (
  id: string | undefined,
  traits: { [key: string]: unknown } = {},
  config: IPluginConfig = {},
) => {
  const trackingId = config.trackingId;
  if (!window.gtag || !trackingId) return;

  if (Object.keys(traits).length) {
    const customDimensions = formateCustomDimensionsIntoCustomMap(config);

    window.gtag('set', {
      custom_map: customDimensions,
      ...traits,
    });

    const trackingConfig = {
      'send_page_view': config.sendPageView,
    }
  
    window.gtag('config', trackingId, trackingConfig);
  }
}

const getInstanceDetails = (pluginConfig: IPluginConfig) => {
  const { instanceName } = pluginConfig;

  return {
    instancePrefix: instanceName ? `${instanceName}.` : '',
    instanceName: `gtag_${instanceName}`,
  }
}

const gtagNotLoaded = (scriptSrc: string) => {
  return scriptLoaded(scriptSrc)
}

const scriptLoaded = (scriptSrc: string) => {
  const scripts = document.querySelectorAll('script[src]');
  const regex = new RegExp(`^${scriptSrc}`);
  return Boolean(Object.keys(scripts).filter(
    // @ts-ignore
    (key) => regex.test(scripts[key].src)
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
