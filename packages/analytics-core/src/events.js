/* Core Analytic Events */

export const coreEvents = [
  /**
   * `bootstrap` - Fires when analytics library starts up.
   * This is the first event fired. '.on/once' listeners are not allowed on bootstrap
   * Plugins can attach logic to this event
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
   * `initializeStart` - Fires before 'initialize', allows for plugins to cancel loading of other plugins
   */
  'initializeStart',
  /**
   * `initialize` - Fires when analytics loads plugins
   */
  'initialize',
  /**
   * `initializeEnd` - Fires after initialize, allows for plugins to run logic after initialization methods run
   */
  'initializeEnd',
  /**
   * `ready` - Fires when all analytic providers are fully loaded. This waits for 'initialize' and 'loaded' to return true
   */
  'ready',
  /**
   * `resetStart` - Fires if analytic.reset() is called.
   * Use this event to cancel reset based on a specific condition
   */
  'resetStart',
  /**
   * `reset` - Fires if analytic.reset() is called.
   * Use this event to run custom cleanup logic (if needed)
   */
  'reset',
  /**
   * `resetEnd` - Fires after analytic.reset() is called.
   * Use this event to run a callback after user data is reset
   */
  'resetEnd',
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
  /**
   * `registerPlugins` - Fires when analytics is registering plugins
   */
  'registerPlugins',
  /**
   * `enablePlugin` - Fires when 'analytics.plugins.enable()' is called
   */
  'enablePlugin',
  /**
   * `disablePlugin` - Fires when 'analytics.plugins.disable()' is called
   */
  'disablePlugin',
  /*
   * `loadPlugin` - Fires when 'analytics.loadPlugin()' is called
   */
  // 'loadPlugin',
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
   * `setItemStart` - Fires when analytics.storage.setItem is initialized.
   * This event gives plugins the ability to intercept keys & values and alter them before they are persisted.
   */
  'setItemStart',
  /**
   * `setItem` - Fires when analytics.storage.setItem is called.
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
   * `removeItemStart` - Fires when analytics.storage.removeItem is initialized.
   * This event gives plugins the ability to intercept removeItem calls and abort / alter them.
   */
  'removeItemStart',
  /**
   * `removeItem` - Fires when analytics.storage.removeItem is called.
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

/* Keys on a plugin that are not considered events */
export const nonEvents = ['name', 'EVENTS', 'config', 'loaded']

const pluginEvents = {
  registerPluginType: (name) => `registerPlugin:${name}`,
  pluginReadyType: (name) => `ready:${name}`,
}

const EVENTS = coreEvents.reduce((acc, curr) => {
  acc[curr] = curr
  return acc
}, pluginEvents)

export default EVENTS

export function isReservedAction(type) {
  return coreEvents.includes(type)
}
