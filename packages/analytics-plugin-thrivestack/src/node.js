/**
 * ThriveStack analytics Node.js integration
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.apiKey - ThriveStack API key
 * @param {object} [pluginConfig.apiEndpoint] - Custom API endpoint
 * @param {object} [pluginConfig.options] - ThriveStack options
 * @returns {object} Analytics plugin
 */
function thriveStackPlugin(pluginConfig = {}) {
  if (!pluginConfig.apiKey) {
    throw new Error("API Key is required for analytics plugin initialization");
  }

  let instance = null;
  let initCompleted = false;
  const API_URL = pluginConfig.apiEndpoint || 'https://api.app.thrivestack.ai/api';
  let API_KEY = pluginConfig.apiKey;
  const options = {
    respectDoNotTrack: pluginConfig.respectDoNotTrack !== false,
    source: pluginConfig.source || '',
    batchSize: pluginConfig.batchSize || 10,
    batchInterval: pluginConfig.batchInterval || 2000,
    ...pluginConfig.options
  };

  let userId = '';
  let anonymousId = 'server_' + Math.random().toString(36).substring(2, 15);
  let groupId = '';
  const eventQueue = [];
  let queueTimer = null;

  const initComplete = (i) => {
    instance = i;
    initCompleted = true;
    console.log('ThriveStack initialization completed (server-side)');
  };

  // Generate server-side IDs
  const generateDeviceId = () => {
    return 'server_device_' + Math.random().toString(36).substring(2, 15);
  };

  const generateSessionId = () => {
    return 'server_session_' + Math.random().toString(36).substring(2, 15);
  };

  // Queue events for batch processing
  const queueEvent = (events) => {
    eventQueue.push(...events);
    
    if (eventQueue.length >= options.batchSize) {
      processQueue();
    } else if (!queueTimer) {
      queueTimer = setTimeout(() => processQueue(), options.batchInterval);
    }
  };

  // Process queued events
  const processQueue = async () => {
    if (eventQueue.length === 0) return;
    
    const eventsToProcess = [...eventQueue];
    eventQueue.length = 0;
    clearTimeout(queueTimer);
    queueTimer = null;
    
    try {
      await sendEvents(eventsToProcess);
    } catch (error) {
      console.error('Failed to process event queue:', error);
      // Put events back in the queue
      eventQueue.unshift(...eventsToProcess);
    }
  };

  // Send events to ThriveStack API
  const sendEvents = async (events) => {
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(events)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending events to ThriveStack:', error);
      throw error;
    }
  };

  // Create plugin object
  const plugin = {
    name: 'thrivestack',
    config: {
      ...pluginConfig,
      options
    },

    initialize: ({ config, instance: analyticsInstance }) => {
      if (!config.apiKey) {
        throw new Error("API Key is required for analytics plugin initialization");
      }

      API_KEY = config.apiKey;
      
      // Initialize is simpler in Node.js - no script to load
      initComplete(analyticsInstance);
      initCompleted = true;
      
      console.log('ThriveStack plugin initialized (server-side)');
    },

    // Core methods

    identify: ({ payload }) => {
      const { userId: id, traits = {}, options: opts = {} } = payload;
      userId = id || '';
      
      try {
        const deviceId = generateDeviceId();
        const sessionId = generateSessionId();
        const timestamp = opts.timestamp || new Date().toISOString();
        const source = opts.source || options.source;
        
        const identifyPayload = [{
          user_id: userId,
          traits: traits,
          timestamp: timestamp,
          context: {
            group_id: groupId,
            device_id: deviceId,
            session_id: sessionId,
            source: source
          }
        }];
        
        const fetch = require('node-fetch');
        return fetch(`${API_URL}/identify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify(identifyPayload)
        })
          .then(res => res.json())
          .then(result => {
            console.log('Identify sent successfully (server-side):', result);
            return result;
          })
          .catch(err => {
            console.error('Failed to send identify event (server-side):', err);
            throw err;
          });
      } catch (err) {
        console.error('Failed to send identify event (server-side):', err);
        throw err;
      }
    },

    track: ({ payload }) => {
      const { event, properties = {}, options: opts = {} } = payload;
      
      try {
        const deviceId = generateDeviceId();
        const sessionId = generateSessionId();
        const timestamp = opts.timestamp || new Date().toISOString();
        const eventUserId = opts.userId || opts.user_id || userId;
        const eventGroupId = opts.groupId || opts.group_id || groupId;
        const source = opts.source || options.source;
        
        const eventPayload = [{
          event_name: event,
          properties: properties,
          user_id: eventUserId,
          context: {
            group_id: eventGroupId,
            device_id: deviceId,
            session_id: sessionId,
            source: source
          },
          timestamp: timestamp
        }];
        
        queueEvent(eventPayload);
        return Promise.resolve({ queued: true });
      } catch (err) {
        console.error('Failed to queue track event (server-side):', err);
        return Promise.reject(err);
      }
    },

    page: ({ payload }) => {
      const { properties = {}, options: opts = {} } = payload;
      
      try {
        const deviceId = generateDeviceId();
        const sessionId = generateSessionId();
        const timestamp = opts.timestamp || new Date().toISOString();
        const pageUserId = opts.userId || opts.user_id || userId;
        const pageGroupId = opts.groupId || opts.group_id || groupId;
        const source = opts.source || options.source;
        
        const pagePayload = [{
          event_name: "page_view",
          properties: {
            title: properties.title || '',
            url: properties.url || '',
            path: properties.path || '',
            referrer: properties.referrer || '',
            ...properties
          },
          user_id: pageUserId,
          context: {
            group_id: pageGroupId,
            device_id: deviceId,
            session_id: sessionId,
            source: source
          },
          timestamp: timestamp
        }];
        
        queueEvent(pagePayload);
        return Promise.resolve({ queued: true });
      } catch (err) {
        console.error('Failed to queue page event (server-side):', err);
        return Promise.reject(err);
      }
    },

    reset: (payload, next) => {
      userId = '';
      groupId = '';
      
      console.log('ThriveStack data reset (server-side)');
      if (next) next(payload);
      return Promise.resolve({ success: true });
    },

    ready: () => {
      return initCompleted;
    },

    // Storage methods (simplified for Node.js environment)
    storage: {
      getItem: (key) => {
        // Could implement Redis/database storage for server-side
        return null;
      },
      
      setItem: (key, value) => {
        // Could implement Redis/database storage for server-side
        return false;
      },
      
      removeItem: (key) => {
        // Could implement Redis/database storage for server-side
        return false;
      }
    },

    // Context methods
    setAnonymousId: (id) => {
      anonymousId = id;
      return true;
    },

    // User methods
    user: () => {
      return {
        id: userId || null,
        anonymousId: anonymousId,
        isAuthenticated: !!userId
      };
    },

    // Plugin-specific methods
    methods: {
      // Group identification
      groupIdentify: (groupId, traits = {}, options = {}, callback) => {
        try {
          const deviceId = generateDeviceId();
          const sessionId = generateSessionId();
          const timestamp = options.timestamp || new Date().toISOString();
          const groupUserId = options.userId || options.user_id || userId;
          const source = options.source || '';
          
          const groupPayload = [{
            user_id: groupUserId,
            group_id: groupId,
            traits: traits,
            timestamp: timestamp,
            context: {
              group_id: groupId,
              group_type: traits.group_type,
              device_id: deviceId,
              session_id: sessionId,
              source: source
            }
          }];
          
          const fetch = require('node-fetch');
          return fetch(`${API_URL}/group`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(groupPayload)
          })
            .then(res => res.json())
            .then(result => {
              console.log('Group identify sent successfully (server-side):', result);
              if (callback && typeof callback === 'function') {
                callback(null, result);
              }
              return result;
            })
            .catch(err => {
              console.error('Failed to send group identify (server-side):', err);
              if (callback && typeof callback === 'function') {
                callback(err);
              }
              throw err;
            });
        } catch (err) {
          console.error('Failed to send group identify (server-side):', err);
          if (callback && typeof callback === 'function') {
            callback(err);
          }
          return Promise.reject(err);
        }
      },

      setApiConfig: (config = {}) => {
        if (config.apiKey) {
          API_KEY = config.apiKey;
        }
        
        if (config.source) {
          options.source = config.source;
        }
        
        return true;
      },
      
      setSource: (source) => {
        if (typeof source === 'string') {
          options.source = source;
          return true;
        }
        return false;
      },
      
      getUserId: () => {
        return userId;
      },
      
      getGroupId: () => {
        return groupId;
      },
      
      getSource: () => {
        return options.source;
      },

      // Additional server-side specific methods
      getAnonymousId: () => {
        return anonymousId;
      },
      
      // Flush queued events immediately
      flush: async () => {
        if (queueTimer) {
          clearTimeout(queueTimer);
          queueTimer = null;
        }
        return processQueue();
      }
    }
  };

  return plugin;
}

module.exports = thriveStackPlugin;