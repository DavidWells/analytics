'use strict';

function thriveStackPlugin(pluginConfig = {}) {
  if (!pluginConfig.apiKey) {
    throw new Error("API Key is required for analytics plugin initialization");
  }
  window._tsq = window._tsq || [];
  window.ThriveStack = window.ThriveStack || null;
  let initCompleted = false;
  let API_KEY = pluginConfig.apiKey;
  const options = {
    respectDoNotTrack: pluginConfig.respectDoNotTrack !== false,
    trackClicks: pluginConfig.trackClicks === true,
    trackForms: pluginConfig.trackForms === true,
    enableConsent: pluginConfig.enableConsent === true,
    source: pluginConfig.source || '',
    defaultConsent: pluginConfig.defaultConsent === true,
    batchSize: pluginConfig.batchSize || 10,
    batchInterval: pluginConfig.batchInterval || 2000,
    ...pluginConfig.options
  };
  const initComplete = i => {
    initCompleted = true;
    console.log('ThriveStack initialization completed');
  };
  const normalizeUrl = url => {
    return url.replace(/^https?:\/\//, '').split('/')[0];
  };

  // Cookie utility functions
  const setCookie = (name, value, days = 30) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};${expires};path=/;SameSite=Lax`;
  };
  const getCookie = name => {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        try {
          return JSON.parse(decodeURIComponent(cookie.substring(nameEQ.length)));
        } catch (e) {
          console.error(`Error parsing cookie ${name}:`, e);
          return [];
        }
      }
    }
    return [];
  };
  const isValidDomain = (source = '') => {
    let urlsToCheck = [];
    if (source === 'product') {
      urlsToCheck = getCookie('product_urls');
    } else if (source === 'marketing') {
      urlsToCheck = getCookie('marketing_urls');
    }
    if (!urlsToCheck.length) {
      showValidationError(`No validated ${source || 'website'} URLs found in cookies.`);
      return false;
    }
    const currentHost = window.location.hostname;
    for (const allowedDomain of urlsToCheck) {
      if (currentHost.includes(allowedDomain) || allowedDomain.includes(currentHost)) {
        return true;
      }
    }
    showValidationError(`Current host ${currentHost} does not match any validated ${source || 'website'} domains: ${urlsToCheck.join(', ')}`);
    return false;
  };
  const validateWebsite = async () => {
    try {
      const marketingResponse = await fetch('https://api.dev.app.thrivestack.ai/api/caOnboardingDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': pluginConfig.apiKey
        },
        body: JSON.stringify({
          'sub_step_id': '',
          'step_id': 'name_your_website',
          'module_id': 'marketing_attribution'
        })
      });
      const productResponse = await fetch('https://api.dev.app.thrivestack.ai/api/caOnboardingDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': pluginConfig.apiKey
        },
        body: JSON.stringify({
          'sub_step_id': 'product_url',
          'step_id': 'setup_product_telemetry',
          'module_id': 'product_analytics'
        })
      });
      const marketingResult = await marketingResponse.json();
      const productResult = await productResponse.json();
      console.log("Marketing API Response:", marketingResult, pluginConfig.source);
      console.log("Product API Response:", productResult);
      let marketingUrls = [];
      let productUrls = [];
      if (typeof marketingResult === 'string') {
        try {
          const parsedResult = JSON.parse(marketingResult);
          if (parsedResult.step_details && parsedResult.step_details.length > 0) {
            const stepData = parsedResult.step_details.find(step => step.module_id === 'marketing_attribution' && step.step_id === 'name_your_website');
            if (stepData && stepData.data) {
              const dataObj = JSON.parse(stepData.data);
              if (dataObj.website_urls && Array.isArray(dataObj.website_urls)) {
                marketingUrls = dataObj.website_urls.map(url => normalizeUrl(url));
              }
            }
          }
        } catch (parseError) {
          console.error('Failed to parse marketing response:', parseError);
        }
      } else if (marketingResult && marketingResult.step_details && marketingResult.step_details.length > 0) {
        const stepData = marketingResult.step_details.find(step => step.module_id === 'marketing_attribution' && step.step_id === 'name_your_website');
        if (stepData && stepData.data) {
          try {
            const dataObj = JSON.parse(stepData.data);
            if (dataObj.website_urls && Array.isArray(dataObj.website_urls)) {
              marketingUrls = dataObj.website_urls.map(url => normalizeUrl(url));
            }
          } catch (parseError) {
            console.error('Failed to parse marketing data:', parseError);
          }
        }
      }
      if (typeof productResult === 'string') {
        try {
          const parsedResult = JSON.parse(productResult);
          if (parsedResult.step_details && parsedResult.step_details.length > 0) {
            const stepData = parsedResult.step_details.find(step => step.module_id === 'product_analytics' && step.step_id === 'setup_product_telemetry' && step.sub_step_id === 'product_url');
            if (stepData && stepData.data) {
              const dataObj = JSON.parse(stepData.data);
              if (dataObj.website_urls && Array.isArray(dataObj.website_urls)) {
                productUrls = dataObj.website_urls.map(url => normalizeUrl(url));
              }
            }
          }
        } catch (parseError) {
          console.error('Failed to parse product response:', parseError);
        }
      } else if (productResult && productResult.step_details && productResult.step_details.length > 0) {
        const stepData = productResult.step_details.find(step => step.module_id === 'product_analytics' && step.step_id === 'setup_product_telemetry' && step.sub_step_id === 'product_url');
        if (stepData && stepData.data) {
          try {
            const dataObj = JSON.parse(stepData.data);
            if (dataObj.website_urls && Array.isArray(dataObj.website_urls)) {
              productUrls = dataObj.website_urls.map(url => normalizeUrl(url));
            }
          } catch (parseError) {
            console.error('Failed to parse product data:', parseError);
          }
        }
      }
      setCookie('marketing_urls', marketingUrls);
      setCookie('product_urls', productUrls);
      console.log('Stored marketing URLs in cookies:', marketingUrls);
      console.log('Stored product URLs in cookies:', productUrls);
      const currentHost = window.location.hostname;
      const isMarketingValid = marketingUrls.some(url => currentHost.includes(url) || url.includes(currentHost));
      const isProductValid = productUrls.some(url => currentHost.includes(url) || url.includes(currentHost));
      if (marketingUrls.length === 0 && productUrls.length === 0) {
        console.error('ThriveStack Validation Error: Domain validation failed...');
        return false;
      }
      if (!isMarketingValid && !isProductValid) {
        showValidationError(`Domain ${currentHost} is not authorized. Analytics tracking will be limited.`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to validate website:', error);
      return false;
    }
  };
  const showValidationError = message => {
    console.error('ThriveStack Validation Error:', message);
  };
  const loadThriveStackScript = () => {
    return new Promise((resolve, reject) => {
      if (window.ThriveStack) {
        resolve(window.ThriveStack);
        return;
      }
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://thrivestack-temp-static-assets.s3.us-east-1.amazonaws.com/scripts/latest/thrivestack.js';
      if (API_KEY) {
        script.setAttribute('api-key', API_KEY);
      }
      if (options.source) {
        script.setAttribute('source', options.source);
      }
      if (options.trackClicks) {
        script.setAttribute('track-clicks', 'true');
      }
      if (options.trackForms) {
        script.setAttribute('track-forms', 'true');
      }
      if (options.respectDoNotTrack !== undefined) {
        script.setAttribute('respect-dnt', options.respectDoNotTrack ? 'true' : 'false');
      }
      script.onload = () => {
        if (window.ThriveStack) {
          if (options.debug) {
            window.ThriveStack.enableDebugMode();
          }
          resolve(window.ThriveStack);
        } else {
          reject(new Error('ThriveStack script loaded but window.ThriveStack is not defined'));
        }
      };
      script.onerror = () => {
        reject(new Error('Failed to load ThriveStack script'));
      };
      document.head.appendChild(script);
    });
  };
  const processQueue = () => {
    if (!window.ThriveStack || !Array.isArray(window._tsq) || window._tsq.length === 0) {
      return;
    }
    window._tsq.forEach(([method, args]) => {
      if (typeof plugin[method] === 'function') {
        try {
          plugin[method](args);
        } catch (err) {
          console.error(`Failed to replay queued ${method}:`, err);
        }
      }
    });
    window._tsq = [];
  };
  const plugin = {
    name: 'thrivestack',
    config: {
      ...pluginConfig,
      options
    },
    initialize: async ({
      config,
      instance: analyticsInstance
    }) => {
      API_KEY = config.apiKey;
      try {
        await loadThriveStackScript();
        console.log('ThriveStack script loaded successfully');
        if (window.ThriveStack) {
          if (config.userId) {
            await window.ThriveStack.init(config.userId, options.source || '');
          } else {
            await window.ThriveStack.init();
          }
          console.log('ThriveStack plugin initialized');
        }
        const isValid = await validateWebsite();
        if (!isValid) {
          showValidationError('Website domain validation failed. Analytics calls will be blocked.');
        }
        initComplete(analyticsInstance);
        initCompleted = true;
        processQueue();
      } catch (error) {
        console.error('Failed to initialize ThriveStack plugin:', error);
        throw error;
      }
    },
    // CORE-METHODS

    identify: ({
      payload
    }) => {
      if (!initCompleted || !window.ThriveStack) {
        window._tsq.push(["identify", {
          payload
        }]);
        return;
      }
      const {
        userId,
        traits = {},
        options = {}
      } = payload;
      const source = options.source || window.ThriveStack.getSource() || '';
      if (!isValidDomain(source)) {
        showValidationError(`Website domain not validated for source '${source}'. Identify call blocked.`);
        return;
      }
      try {
        const deviceId = window.ThriveStack.getDeviceId();
        if (options.source === 'marketing' && !deviceId) {
          const error = new Error('Identify call requires deviceId to be present');
          console.error('Failed to send identify event:', error);
          if (options.callback && typeof options.callback === 'function') {
            options.callback(error);
          }
          return;
        }
        const identifyPayload = [{
          user_id: userId || '',
          traits: traits,
          timestamp: options.timestamp || new Date().toISOString(),
          context: {
            group_id: options.groupId || options.group_id || window.ThriveStack.groupId || '',
            device_id: deviceId,
            session_id: window.ThriveStack.getSessionId() || '',
            source: window.ThriveStack.getSource() || options.source || ''
          }
        }];
        window.ThriveStack.identify(identifyPayload).then(result => console.log('Identify sent successfully:', result)).catch(err => {
          console.error('Failed to send identify event:', err);
          if (options.callback && typeof options.callback === 'function') {
            options.callback(err);
          }
        });
      } catch (err) {
        console.error('Failed to send identify event:', err);
        if (options.callback && typeof options.callback === 'function') {
          options.callback(err);
        }
      }
    },
    track: ({
      payload
    }) => {
      if (!initCompleted || !window.ThriveStack) {
        window._tsq.push(["track", {
          payload
        }]);
        return;
      }
      const {
        event,
        properties = {},
        options = {}
      } = payload;
      const source = options.source || window.ThriveStack.getSource() || '';
      if (!isValidDomain(source)) {
        showValidationError(`Website domain not validated for source '${source}'. Identify call blocked.`);
        return;
      }
      try {
        const deviceId = window.ThriveStack.getDeviceId();
        const userId = options.userId || options.user_id || window.ThriveStack.userId;
        if (options.source === 'marketing' && !userId && !deviceId) {
          const error = new Error('Track event requires either userId or deviceId');
          console.error('Failed to send track event:', error);
          if (options.callback && typeof options.callback === 'function') {
            options.callback(error);
          }
          return;
        }
        const sessionId = window.ThriveStack.getSessionId() || '';
        const groupId = options.groupId || options.group_id || window.ThriveStack.groupId || '';
        const source = window.ThriveStack.getSource() || options.source || '';
        const eventPayload = [{
          event_name: event,
          properties: properties,
          user_id: userId || '',
          context: {
            group_id: groupId,
            device_id: deviceId || '',
            session_id: sessionId,
            source: source
          },
          timestamp: options.timestamp || new Date().toISOString()
        }];
        window.ThriveStack.queueEvent(eventPayload);
      } catch (err) {
        console.error('Failed to send track event:', err);
        if (options.callback && typeof options.callback === 'function') {
          options.callback(err);
        }
      }
    },
    page: ({
      payload
    }) => {
      if (!initCompleted || !window.ThriveStack) {
        window._tsq.push(["page", {
          payload
        }]);
        return;
      }
      const {
        properties = {},
        options = {}
      } = payload;
      const source = options.source || window.ThriveStack.getSource() || '';
      if (!isValidDomain(source)) {
        showValidationError(`Website domain not validated for source '${source}'. Page call blocked.`);
        return;
      }
      try {
        window.ThriveStack.capturePageVisit();
      } catch (err) {
        console.error('Failed to send page event:', err);
      }
    },
    reset: (payload, next) => {
      if (!window.ThriveStack) {
        if (next) next(payload);
        return;
      }
      try {
        window.ThriveStack.setUserId('');
        window.ThriveStack.setGroupId('');
        const pastDate = new Date(0);
        document.cookie = `thrivestack_user_id=;expires=${pastDate.toUTCString()};path=/;SameSite=Lax`;
        document.cookie = `thrivestack_group_id=;expires=${pastDate.toUTCString()};path=/;SameSite=Lax`;
        document.cookie = `product_urls=;expires=${pastDate.toUTCString()};path=/;SameSite=Lax`;
        document.cookie = `marketing_urls=;expires=${pastDate.toUTCString()};path=/;SameSite=Lax`;
        console.log('ThriveStack data reset');
        if (next) next(payload);
        return true;
      } catch (err) {
        console.error('Failed to reset ThriveStack data:', err);
        if (next) next(payload);
        return false;
      }
    },
    ready: payload => {
      return initCompleted;
    },
    storage: {
      getItem: key => {
        try {
          return getCookie(`thrivestack_${key}`);
        } catch (err) {
          console.error('Failed to get item from storage:', err);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          setCookie(`thrivestack_${key}`, value);
          return true;
        } catch (err) {
          console.error('Failed to set item in storage:', err);
          return false;
        }
      },
      removeItem: key => {
        try {
          const pastDate = new Date(0);
          document.cookie = `thrivestack_${key}=;expires=${pastDate.toUTCString()};path=/;SameSite=Lax`;
          return true;
        } catch (err) {
          console.error('Failed to remove item from storage:', err);
          return false;
        }
      }
    },
    setAnonymousId: anonymousId => {
      if (!window.ThriveStack) return false;
      const source = options.source || window.ThriveStack.getSource() || '';
      if (!isValidDomain(source)) {
        showValidationError(`Website domain not validated for source '${source}'. setAnonymousId call blocked.`);
        return;
      }
      try {
        const currentDeviceId = window.ThriveStack.getDeviceId();
        if (currentDeviceId !== anonymousId) {
          showValidationError('ThriveStack device ID is automatically generated and cannot be overridden');
        }
        return true;
      } catch (err) {
        console.error('Failed to set anonymous ID:', err);
        return false;
      }
    },
    user: () => {
      if (!window.ThriveStack) return null;
      const source = options.source || window.ThriveStack.getSource() || '';
      if (!isValidDomain(source)) {
        showValidationError(`Website domain not validated for source '${source}'. User call blocked.`);
        return;
      }
      return {
        id: window.ThriveStack.userId || null,
        anonymousId: window.ThriveStack.getDeviceId() || null,
        isAuthenticated: !!window.ThriveStack.userId
      };
    },
    methods: {
      group: (groupId, traits = {}, options = {}, callback) => {
        if (!window.ThriveStack) {
          const error = new Error('ThriveStack not initialized');
          if (callback && typeof callback === 'function') {
            callback(error);
          }
          return Promise.reject(error);
        }
        const source = options.source || window.ThriveStack.getSource() || '';
        if (!isValidDomain(source)) {
          const error = new Error(`Website domain not validated for source '${source}'. Group call blocked.`);
          showValidationError(error.message);
          if (callback && typeof callback === 'function') {
            callback(error);
          }
          return Promise.reject(error);
        }
        const userId = options.userId || options.user_id || window.ThriveStack.userId;
        if (options.source === 'marketing' && !userId) {
          const error = new Error('Group identify requires userId to be present');
          showValidationError('Group identify failed:');
          if (callback && typeof callback === 'function') {
            callback(error);
          }
          return Promise.reject(error);
        }
        if (!groupId) {
          const error = new Error('Group identify requires groupId to be present');
          showValidationError('Group identify failed:');
          if (callback && typeof callback === 'function') {
            callback(error);
          }
          return Promise.reject(error);
        }
        const timestamp = options.timestamp || new Date().toISOString();
        const groupPayload = [{
          user_id: userId,
          group_id: groupId,
          traits: traits,
          timestamp: timestamp,
          context: {
            group_id: groupId,
            group_type: traits.group_type,
            device_id: window.ThriveStack.getDeviceId() || '',
            session_id: window.ThriveStack.getSessionId() || '',
            source: window.ThriveStack.getSource() || options.source || ''
          }
        }];
        return window.ThriveStack.group(groupPayload).then(result => {
          if (callback && typeof callback === 'function') {
            callback(null, result);
          }
          return result;
        }).catch(err => {
          showValidationError('Failed to send group event:');
          if (callback && typeof callback === 'function') {
            callback(err);
          }
          throw err;
        });
      },
      setApiConfig: (config = {}) => {
        const source = options.source || window.ThriveStack.getSource() || '';
        if (!isValidDomain(source)) {
          showValidationError(`Website domain not validated for source '${source}'. setApiConfig call blocked.`);
          return;
        }
        if (config.apiKey) {
          API_KEY = config.apiKey;
        }
        if (config.source && window.ThriveStack) {
          window.ThriveStack.setSource(config.source);
        }
        return true;
      },
      setConsent: (category, enabled) => {
        const source = options.source || window.ThriveStack.getSource() || '';
        if (!window.ThriveStack || !isValidDomain(source)) {
          showValidationError(`Website domain not validated for source '${source}'. setConsent call blocked.`);
          return false;
        }
        try {
          window.ThriveStack.setConsent(category, enabled);
          return true;
        } catch (err) {
          console.error('Failed to set consent:', err);
          return false;
        }
      },
      getDeviceId: () => {
        if (!window.ThriveStack) {
          return null;
        }
        try {
          return window.ThriveStack.getDeviceId();
        } catch (err) {
          console.error('Failed to get device ID:', err);
          return null;
        }
      },
      getSessionId: () => {
        if (!window.ThriveStack) {
          return null;
        }
        try {
          return window.ThriveStack.getSessionId();
        } catch (err) {
          console.error('Failed to get session ID:', err);
          return null;
        }
      },
      getUserId: () => {
        if (!window.ThriveStack) {
          return null;
        }
        return window.ThriveStack.userId || null;
      },
      getGroupId: () => {
        if (!window.ThriveStack) {
          return null;
        }
        return window.ThriveStack.groupId || null;
      },
      getSource: () => {
        if (!window.ThriveStack) {
          return null;
        }
        try {
          return window.ThriveStack.getSource();
        } catch (err) {
          console.error('Failed to get source:', err);
          return null;
        }
      },
      setSource: source => {
        if (!window.ThriveStack) {
          return false;
        }
        try {
          window.ThriveStack.setSource(source);
          return true;
        } catch (err) {
          console.error('Failed to set source:', err);
          return false;
        }
      },
      getUtmParameters: () => {
        if (!window.ThriveStack) {
          return {};
        }
        try {
          return window.ThriveStack.getUtmParameters();
        } catch (err) {
          console.error('Failed to get UTM parameters:', err);
          return {};
        }
      },
      // Page tracking methods
      capturePageVisit: () => {
        const source = window.ThriveStack ? window.ThriveStack.getSource() || '' : '';
        if (!window.ThriveStack || !isValidDomain(source)) {
          showValidationError(`Website domain not validated for source '${source}'. capturePageVisit call blocked.`);
          return false;
        }
        try {
          window.ThriveStack.capturePageVisit();
          return true;
        } catch (err) {
          console.error('Failed to capture page visit:', err);
          return false;
        }
      },
      // Debug methods
      enableDebugMode: () => {
        if (!window.ThriveStack) {
          return false;
        }
        try {
          window.ThriveStack.enableDebugMode();
          return true;
        } catch (err) {
          console.error('Failed to enable debug mode:', err);
          return false;
        }
      },
      // Get ThriveStack instance (escape hatch)
      getThriveStackInstance: () => {
        return window.ThriveStack;
      },
      // Validate website domain manually
      validateWebsite: async () => {
        return await validateWebsite();
      }
    }
  };
  return plugin;
}

module.exports = thriveStackPlugin;
