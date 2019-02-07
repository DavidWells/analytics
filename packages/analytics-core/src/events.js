/**
 * Core Analytic Events
 */

export const eventKeys = [
  /**
   * `bootstrap` - Fires when analytics library starts up. This is the first event fired
   */
  'bootstrap',
  /**
   * `params` - Fires when analytics parses URL parameters
   */
  'params',
  /**
   * `campaign` - Fires if params contain "utm" parameters
   */
  'campaign',
  /**
   * `initializeStart` - Fires before `initialize`, allows for plugins to cancel loading of other plugins
   */
  'initializeStart',
  /**
   * `initialize` - Fires when analytics bootstraps
   */
  'initialize',
  /**
   * `initializeEnd` - Fires after `initialize`, allows for plugins to run logic after initialization methods run
   */
  'initializeEnd',
  /**
   * `ready` - Fires when all analytic providers are fully loaded.
   * This waits for `initialize` and `loaded` to return true
   */
  'ready',
  /**
   * `reset` - Fires if analytic.reset() is called.
   * Use this event to run custom cleanup logic (if needed)
   */
  'reset',
  /******************
   * Page Events
   ******************/
  /**
   * `pageStart` - Fires before 'page' events fire.
   *  This allows for dynamic page view cancellation based on current state of user or options passed in.
   */
  'pageStart',
  /**
   * `page` - Core analytics hook for page views.
   *  If your plugin or integration tracks page views, this is the event to fire on.
   */
  'page',
  /**
   * `pageEnd` - Fires after all registered 'page' methods fire.
   */
  'pageEnd',
  /**
   * `pageAborted` - Fires if 'page' call is cancelled by a plugin
   */
  'pageAborted',
  /****************
   * Track Events
   ***************/
  /**
   * `trackStart` - Called before the 'track' events fires.
   *  This allows for dynamic page view cancellation based on current state of user or options passed in.
   */
  'trackStart',
  /**
   * `track` - Core analytics hook for event tracking.
   *  If your plugin or integration tracks custom events, this is the event to fire on.
   */
  'track',
  /**
   * `trackEnd` - Fires after all registered 'track' events fire from plugins.
   */
  'trackEnd',
  /**
   * `trackAborted` - Fires if 'track' call is cancelled by a plugin
   */
  'trackAborted',
  /******************
   * Identify Events
   ******************/
  /**
   * `identifyStart` - Called before the 'identify' events fires.
   * This allows for dynamic page view cancellation based on current state of user or options passed in.
   */
  'identifyStart',
  /**
   * `identify` - Core analytics hook for user identification.
   *  If your plugin or integration identifies users or user traits, this is the event to fire on.
   */
  'identify',
  /**
   * `identifyEnd` - Fires after all registered 'identify' events fire from plugins.
   */
  'identifyEnd',
  /**
   * `identifyAborted` - Fires if 'track' call is cancelled by a plugin
   */
  'identifyAborted',
  /**
   * `userIdChanged` - Fires when a user id is updated
   */
  'userIdChanged',
  /******************
   * Plugin Events
   ******************/
  /*! Not currently in use
   * `pluginRegister` - Fires when analytics.enablePlugin is called
   */
  'registerPlugins',
  'pluginRegister',
  /**
   * `pluginsRegistered` - Fires after all plugins have been registered
   */
  'pluginsRegistered',
  /**
   * `pluginFailed` - Fires if a plugin fails to load.
   * Loading is checked by a 'loaded' method on plugin that returns a boolean.
   */
  'pluginFailed',
  /**
   * `loadPlugin` - Fires when `analytics.loadPlugin()` is called
   */
  'loadPlugin',
  /**
   * `enablePlugin` - Fires when `analytics.enablePlugin()` is called
   */
  'enablePlugin',
  /**
   * `disablePlugin` - Fires when `analytics.disablePlugin()` is called
   */
  'disablePlugin',
  /******************
   * Browser activity events
   ******************/
  /**
   * `online` - Fires when browser network goes online.
   * This fires only when coming back online from an offline state.
   */
  'online',
  /**
   * `offline` - Fires when browser network goes offline.
   */
  'offline',
  /******************
   * Storage events
   ******************/
  /**
   * `setItemStart` - Fires when analtyics.storage.setItem is initialized.
   * This event gives plugins the ability to intercept keys & values and alter them before they are persisted.
   */
  'setItemStart',
  /**
   * `setItem` - Fires when analtyics.storage.setItem is called.
   * This event gives plugins the ability to intercept keys & values and alter them before they are persisted.
   */
  'setItem',
  /**
   * `setItemEnd` - Fires when setItem storage is complete.
   */
  'setItemEnd',
  /**
   * `setItemAborted` - Fires when setItem storage is cancelled by a plugin.
   */
  'setItemAborted',
  /**
   * `removeItemStart` - Fires when analtyics.storage.removeItem is initialized.
   * This event gives plugins the ability to intercept removeItem calls and abort / alter them.
   */
  'removeItemStart',
  /**
   * `removeItem` - Fires when analtyics.storage.removeItem is called.
   * This event gives plugins the ability to intercept removeItem calls and abort / alter them.
   */
  'removeItem',
  /**
   * `removeItemEnd` - Fires when removeItem storage is complete.
   */
  'removeItemEnd',
  /**
   * `removeItemAborted` - Fires when removeItem storage is cancelled by a plugin.
   */
  'removeItemAborted',
]

const pluginEvents = {
  pluginRegisterType: (name) => `pluginRegister:${name}`,
  pluginReadyType: (name) => `pluginReady:${name}`,
}

const EVENTS = eventKeys.reduce((acc, curr) => {
  acc[curr] = curr
  return acc
}, pluginEvents)

export default EVENTS

export function isReservedAction(type) {
  return eventKeys.includes(type)
}
