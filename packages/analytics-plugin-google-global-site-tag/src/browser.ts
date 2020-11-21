/* global, window */
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
  tracking_id?: string,
  instance_name?: string,
  custom_script_src?: string,
  domain?: string,
  cookie_config?: ICookieConfig,
  linker?: ILinkerConfig,

  send_page_view?: boolean,
}

interface IPluginApiProps {
  instance: string,
  config: IPluginConfig,
}

interface IIdentifyPayload {

}

interface IIdentifyProps {
  payload: IIdentifyPayload,
  config: IPluginConfig,
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: ReturnType<typeof setUpWindowGtag>;
  }
}

const defaultConfig = {
  tracking_id: null,
  send_page_view: true,
}

let loadedInstances: { [key: string]: boolean } = {};

const googleGtagAnalytics = (pluginConfig: IPluginConfig = {}) => {
  // Allow for multiple google analytics instances
  const { instance_name, instance_prefix } = getInstanceDetails(pluginConfig)

  const trackingId = pluginConfig.tracking_id;

  return {
    name: 'googlt-gtag-analytics',
    config: {
      ...defaultConfig,
      ...pluginConfig,
    },
    
    // Load gtag.js and define gtag
    // gtag does not need to be global and defined on window object
    initialize: (pluginApi: IPluginApiProps) => {
      const { config, instance } = pluginApi;
      if (!trackingId) throw new Error('No GA trackingId defined');

      const scriptSrc = config.custom_script_src || `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;

      if (gtagNotLoaded(scriptSrc)) {
        injectScript(scriptSrc);
      }

      if (!window.gtag) {
        setUpWindowGtag();
      }

      // Initialize tracker instance on page
      if (!loadedInstances[instance_name]) {
        let gtagConfig = {
          cookie_domain: config.domain || 'auto',
          send_page_view: config.send_page_view ? config.send_page_view : true,
          linker: config.linker ? config.linker : undefined,
          ...config.cookie_config,
        }

        window.gtag('config', trackingId, gtagConfig);
      }
    },
  }
}

const getInstanceDetails = (pluginConfig: IPluginConfig) => {
  const { instance_name } = pluginConfig;

  return {
    instance_prefix: instance_name ? `${instance_name}.` : '',
    instance_name: `gtag_${instance_name}`,
  }
}

const gtagNotLoaded = (scriptSrc: string) => {
  return !scriptLoaded(scriptSrc)
}

const scriptLoaded = (scriptSrc: string) => {
  const scripts = document.querySelectorAll('script[src]')

  // return Boolean(Object.values(scripts as NodeListOf<HTMLScriptElement>).filter((value) => (value.src || '') === scriptSource).length);
  return !!Object.keys(scripts).filter((key) => (scripts[key].src || '') === scriptSrc).length
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
  function gtagHelper(
    method: 'set' | 'config' | 'event',
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
