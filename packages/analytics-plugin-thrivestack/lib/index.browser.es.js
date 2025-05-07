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
  const isValidDomain = (source = '') => {
    let urlsToCheck = [];
    if (source === 'product') {
      urlsToCheck = JSON.parse(localStorage.getItem('product_urls') || '[]');
    } else if (source === 'marketing') {
      urlsToCheck = JSON.parse(localStorage.getItem('marketing_urls') || '[]');
    } else {
      urlsToCheck = JSON.parse(localStorage.getItem('website_urls') || '[]');
    }
    if (!urlsToCheck.length) {
      console.warn(`No validated ${source || 'website'} URLs found in localStorage.`);
      return false;
    }
    const currentHost = window.location.hostname;
    for (const allowedDomain of urlsToCheck) {
      if (currentHost.includes(allowedDomain) || allowedDomain.includes(currentHost)) {
        return true;
      }
    }
    console.warn(`Current host ${currentHost} does not match any validated ${source || 'website'} domains: ${urlsToCheck.join(', ')}`);
    return false;
  };
  const validateWebsite = async () => {
    try {
      const productId = 'X6EcdUZFY';
      const environmentId = '2lwIjczu1';
      const response = await fetch(`https://api.dev.app.thrivestack.ai/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query: `query GetCAOnboardingStepDetails($input: GetCAOnboardingStepDetailsInput!) {
          getCAOnboardingStepDetails(input: $input) {
            productId
            environmentId
            moduleDetails {
              moduleId
              stepDetails {
                stepId
                isCompleted
                value
                subStepDetails {
                  subStepId
                  isCompleted
                  value    
                }
              }
            }
          }
        }`,
          variables: {
            input: {
              productId: productId,
              environmentId: environmentId
            }
          }
        })
      });
      const result = await response.json();
      console.log("API Response:", result);
      if (result.data && result.data.getCAOnboardingStepDetails) {
        const moduleDetails = result.data.getCAOnboardingStepDetails.moduleDetails;
        let marketingUrls = [];
        let productUrls = [];
        for (const module of moduleDetails) {
          if (module.moduleId === 'marketing_attribution') {
            for (const step of module.stepDetails) {
              if (step.stepId === 'name_your_website' && step.value) {
                try {
                  const stepValue = JSON.parse(step.value);
                  if (stepValue.website_urls && Array.isArray(stepValue.website_urls)) {
                    marketingUrls = stepValue.website_urls.map(url => normalizeUrl(url));
                  }
                } catch (parseError) {
                  console.error('Failed to parse marketing URLs JSON:', parseError);
                }
              }
            }
          }
          if (module.moduleId === 'product_analytics') {
            for (const step of module.stepDetails) {
              for (const subStep of step.subStepDetails || []) {
                if (subStep.subStepId === 'product_url' && subStep.value) {
                  try {
                    const subStepValue = JSON.parse(subStep.value);
                    if (subStepValue.website_urls && Array.isArray(subStepValue.website_urls)) {
                      productUrls = subStepValue.website_urls.map(url => normalizeUrl(url));
                    }
                  } catch (parseError) {
                    console.error('Failed to parse product URLs JSON:', parseError);
                  }
                }
              }
            }
          }
        }
        localStorage.setItem('website_urls', JSON.stringify([...productUrls, ...marketingUrls]));
        localStorage.setItem('product_urls', JSON.stringify(productUrls));
        localStorage.setItem('marketing_urls', JSON.stringify(marketingUrls));
        console.log('Stored product URLs:', productUrls);
        console.log('Stored marketing URLs:', marketingUrls);
        return true;
      }
      console.warn('No valid website URLs found in API response');
      return false;
    } catch (error) {
      console.error('Failed to validate website:', error);
      return false;
    }
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
          console.warn('Website domain validation failed. Analytics calls will be blocked.');
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
        console.warn(`Website domain not validated for source '${source}'. Identify call blocked.`);
        return;
      }
      try {
        // Get deviceId without fallback
        const deviceId = window.ThriveStack.getDeviceId();

        // Validation: deviceId must be present
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
          // Use empty string only when sending the payload
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
        console.warn(`Website domain not validated for source '${source}'. Identify call blocked.`);
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
        console.warn(`Website domain not validated for source '${source}'. Page call blocked.`);
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
          return localStorage.getItem(`thrivestack_${key}`);
        } catch (err) {
          console.error('Failed to get item from storage:', err);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(`thrivestack_${key}`, value);
          return true;
        } catch (err) {
          console.error('Failed to set item in storage:', err);
          return false;
        }
      },
      removeItem: key => {
        try {
          localStorage.removeItem(`thrivestack_${key}`);
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
        console.warn(`Website domain not validated for source '${source}'. setAnonymousId call blocked.`);
        return;
      }
      try {
        const currentDeviceId = window.ThriveStack.getDeviceId();
        if (currentDeviceId !== anonymousId) {
          console.warn('ThriveStack device ID is automatically generated and cannot be overridden');
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
        console.warn(`Website domain not validated for source '${source}'. User call blocked.`);
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

        // Check domain validation before processing
        if (!isValidDomain(source)) {
          const error = new Error(`Website domain not validated for source '${source}'. Group call blocked.`);
          console.warn(error.message);
          if (callback && typeof callback === 'function') {
            callback(error);
          }
          return Promise.reject(error);
        }

        // Get userId without fallback
        const userId = options.userId || options.user_id || window.ThriveStack.userId;

        // Validation: both userId and groupId must be present
        if (options.source === 'marketing' && !userId) {
          const error = new Error('Group identify requires userId to be present');
          console.error('Group identify failed:', error);
          if (callback && typeof callback === 'function') {
            callback(error);
          }
          return Promise.reject(error);
        }
        if (!groupId) {
          const error = new Error('Group identify requires groupId to be present');
          console.error('Group identify failed:', error);
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
          console.error('Failed to send group event:', err);
          if (callback && typeof callback === 'function') {
            callback(err);
          }
          throw err;
        });
      },
      setApiConfig: (config = {}) => {
        const source = options.source || window.ThriveStack.getSource() || '';
        if (!isValidDomain(source)) {
          console.warn(`Website domain not validated for source '${source}'. setApiConfig call blocked.`);
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
          console.warn(`Website domain not validated for source '${source}'. setConsent call blocked.`);
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
          console.warn(`Website domain not validated for source '${source}'. capturePageVisit call blocked.`);
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

export { thriveStackPlugin as default };
