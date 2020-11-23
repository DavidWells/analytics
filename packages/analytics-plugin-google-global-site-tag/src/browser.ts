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
  payload: { [key: string]: unknown },
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
        const trackingConfig = {
          'send_page_view': config.sendPageView,
        }
        window.gtag('config', trackingId, trackingConfig);
        loadedInstances[instanceName] = true
      }
    },

    identify: (props: IIdentifyProps) => {
      const { payload, config } = props;
      identifyVisitor(payload.userId, payload.traits, config)
    },
  }
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
