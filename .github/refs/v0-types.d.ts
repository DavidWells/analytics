declare module "analytics" {
  /**
   * Core Analytic constants. These are exposed for third party plugins & listeners
   * @property ANON_ID - Anonymous visitor Id localstorage key
   * @property USER_ID - Visitor Id localstorage key
   * @property USER_TRAITS - Visitor traits localstorage key
   */
  type constants = {
      ANON_ID: ANON_ID;
      USER_ID: USER_ID;
      USER_TRAITS: USER_TRAITS;
  };

  /**
   * Anonymous visitor Id localstorage key
   */
  type ANON_ID = string;

  /**
   * Visitor Id localstorage key
   */
  type USER_ID = string;

  /**
   * Visitor traits localstorage key
   */
  type USER_TRAITS = string;

  /**
   * Analytics library configuration
   *
   * After the library is initialized with config, the core API is exposed & ready for use in the application.
   * @example
   * import Analytics from 'analytics'
   * import pluginABC from 'analytics-plugin-abc'
   * import pluginXYZ from 'analytics-plugin-xyz'
   *
   * // initialize analytics
   * const analytics = Analytics({
   *   app: 'my-awesome-app',
   *   plugins: [
   *     pluginABC,
   *     pluginXYZ
   *   ]
   * })
   * @param config - analytics core config
   * @param [config.app] - Name of site / app
   * @param [config.version] - Version of your app
   * @param [config.debug] - Should analytics run in debug mode
   * @param [config.plugins] - Array of analytics plugins
   * @returns Analytics Instance
   */
  function analytics(config: {
      app?: string;
      version?: string | number;
      debug?: boolean;
      plugins?: AnalyticsPlugin[];
  }): AnalyticsInstance;

  /**
   * Async Management methods for plugins.
   *
   * This is also where [custom methods](https://bit.ly/329vFXy) are loaded into the instance.
   * @example
   * // Enable a plugin by namespace
   * analytics.plugins.enable('keenio')
   *
   * // Disable a plugin by namespace
   * analytics.plugins.disable('google-analytics')
   * @property enable - Set storage value
   * @property disable - Remove storage value
   */
  type Plugins = {
      enable: EnablePlugin;
      disable: DisablePlugin;
  };

  /**
   * Enable analytics plugin
   * @example
   * analytics.plugins.enable('google-analytics').then(() => {
   *   console.log('do stuff')
   * })
   *
   * // Enable multiple plugins at once
   * analytics.plugins.enable(['google-analytics', 'segment']).then(() => {
   *   console.log('do stuff')
   * })
   * @param plugins - name of plugins(s) to disable
   * @param [callback] - callback after enable runs
   */
  type EnablePlugin = (plugins: string | string[], callback?: (...params: any[]) => any) => Promise<any>;

  /**
   * Disable analytics plugin
   * @example
   * analytics.plugins.disable('google').then(() => {
   *   console.log('do stuff')
   * })
   *
   * analytics.plugins.disable(['google', 'segment']).then(() => {
   *   console.log('do stuff')
   * })
   * @param plugins - name of integration(s) to disable
   * @param [callback] - callback after disable runs
   */
  type DisablePlugin = (plugins: string | string[], callback?: (...params: any[]) => any) => Promise<any>;

  /**
   * Analytic instance returned from initialization
   * @property identify - Identify a user
   * @property track - Track an analytics event
   * @property page - Trigger page view
   * @property user - Get user data
   * @property reset - Clear information about user & reset analytics
   * @property ready - Fire callback on analytics ready event
   * @property on - Fire callback on analytics lifecycle events.
   * @property once - Fire callback on analytics lifecycle events once.
   * @property getState - Get data about user, activity, or context.
   * @property storage - storage methods
   * @property plugins - plugin methods
   */
  export interface AnalyticsInstance  {
      identify: Identify;
      track: Track;
      page: Page;
      user: User;
      reset: Reset;
      ready: Ready;
      on: On;
      once: Once;
      getState: GetState;
      storage: Storage;
      plugins: Plugins;
  }

  /**
   * Identify a user. This will trigger `identify` calls in any installed plugins and will set user data in localStorage
   * @example
   * // Basic user id identify
   * analytics.identify('xyz-123')
   *
   * // Identify with additional traits
   * analytics.identify('xyz-123', {
   *   name: 'steve',
   *   company: 'hello-clicky'
   * })
   *
   * // Fire callback with 2nd or 3rd argument
   * analytics.identify('xyz-123', () => {
   *   console.log('do this after identify')
   * })
   *
   * // Disable sending user data to specific analytic tools
   * analytics.identify('xyz-123', {}, {
   *   plugins: {
   *     // disable sending this identify call to segment
   *     segment: false
   *   }
   * })
   *
   * // Send user data to only to specific analytic tools
   * analytics.identify('xyz-123', {}, {
   *   plugins: {
   *     // disable this specific identify in all plugins except customerio
   *     all: false,
   *     customerio: true
   *   }
   * })
   * @param userId - Unique ID of user
   * @param [traits] - Object of user traits
   * @param [options] - Options to pass to identify call
   * @param [callback] - Callback function after identify completes
   */
  type Identify = (userId: string, traits?: any, options?: any, callback?: (...params: any[]) => any) => Promise<any>;

  /**
   * Track an analytics event. This will trigger `track` calls in any installed plugins
   * @example
   * // Basic event tracking
   * analytics.track('buttonClicked')
   *
   * // Event tracking with payload
   * analytics.track('itemPurchased', {
   *   price: 11,
   *   sku: '1234'
   * })
   *
   * // Fire callback with 2nd or 3rd argument
   * analytics.track('newsletterSubscribed', () => {
   *   console.log('do this after track')
   * })
   *
   * // Disable sending this event to specific analytic tools
   * analytics.track('cartAbandoned', {
   *   items: ['xyz', 'abc']
   * }, {
   *   plugins: {
   *     // disable track event for segment
   *     segment: false
   *   }
   * })
   *
   * // Send event to only to specific analytic tools
   * analytics.track('customerIoOnlyEventExample', {
   *   price: 11,
   *   sku: '1234'
   * }, {
   *   plugins: {
   *     // disable this specific track call all plugins except customerio
   *     all: false,
   *     customerio: true
   *   }
   * })
   * @param eventName - Event name
   * @param [payload] - Event payload
   * @param [options] - Event options
   * @param [callback] - Callback to fire after tracking completes
   */
  type Track = (eventName: string, payload?: any, options?: any, callback?: (...params: any[]) => any) => Promise<any>;

  /**
   * Trigger page view. This will trigger `page` calls in any installed plugins
   * @example
   * // Basic page tracking
   * analytics.page()
   *
   * // Page tracking with page data overrides
   * analytics.page({
   *   url: 'https://google.com'
   * })
   *
   * // Fire callback with 1st, 2nd or 3rd argument
   * analytics.page(() => {
   *   console.log('do this after page')
   * })
   *
   * // Disable sending this pageview to specific analytic tools
   * analytics.page({}, {
   *   plugins: {
   *     // disable page tracking event for segment
   *     segment: false
   *   }
   * })
   *
   * // Send pageview to only to specific analytic tools
   * analytics.page({}, {
   *   plugins: {
   *     // disable this specific page in all plugins except customerio
   *     all: false,
   *     customerio: true
   *   }
   * })
   * @param [data] - Page data overrides.
   * @param [options] - Page tracking options
   * @param [callback] - Callback to fire after page view call completes
   */
  type Page = (data?: PageData, options?: any, callback?: (...params: any[]) => any) => Promise<any>;

  /**
   * Get user data
   * @example
   * // Get all user data
   * const userData = analytics.user()
   *
   * // Get user id
   * const userId = analytics.user('userId')
   *
   * // Get user company name
   * const companyName = analytics.user('traits.company.name')
   * @param [key] - dot.prop.path of user data. Example: 'traits.company.name'
   */
  type User = (key?: string) => string & any;

  /**
   * Clear all information about the visitor & reset analytic state.
   * @example
   * // Reset current visitor
   * analytics.reset()
   * @param [callback] - Handler to run after reset
   */
  type Reset = (callback?: (...params: any[]) => any) => Promise<any>;

  /**
   * Fire callback on analytics ready event
   * @example
   * analytics.ready((payload) => {
   *   console.log('all plugins have loaded or were skipped', payload);
   * })
   * @param callback - function to trigger when all providers have loaded
   */
  type Ready = (callback: (...params: any[]) => any) => DetachListeners;

  /**
   * Attach an event handler function for analytics lifecycle events.
   * @example
   * // Fire function when 'track' calls happen
   * analytics.on('track', ({ payload }) => {
   *   console.log('track call just happened. Do stuff')
   * })
   *
   * // Remove listener before it is called
   * const removeListener = analytics.on('track', ({ payload }) => {
   *   console.log('This will never get called')
   * })
   *
   * // cleanup .on listener
   * removeListener()
   * @param name - Name of event to listen to
   * @param callback - function to fire on event
   */
  type On = (name: string, callback: (...params: any[]) => any) => DetachListeners;

  /**
   * Detach listeners
   */
  export type DetachListeners = () => void;

  /**
   * Attach a handler function to an event and only trigger it once.
   * @example
   * // Fire function only once per 'track'
   * analytics.once('track', ({ payload }) => {
   *   console.log('This is only triggered once when analytics.track() fires')
   * })
   *
   * // Remove listener before it is called
   * const listener = analytics.once('track', ({ payload }) => {
   *   console.log('This will never get called b/c listener() is called')
   * })
   *
   * // cleanup .once listener before it fires
   * listener()
   * @param name - Name of event to listen to
   * @param callback - function to fire on event
   */
  type Once = (name: string, callback: (...params: any[]) => any) => DetachListeners;

  /**
   * Get data about user, activity, or context. Access sub-keys of state with `dot.prop` syntax.
   * @example
   * // Get the current state of analytics
   * analytics.getState()
   *
   * // Get a subpath of state
   * analytics.getState('context.offline')
   * @param [key] - dot.prop.path value of state
   */
  type GetState = (key?: string) => any;

  /**
   * Storage utilities for persisting data.
   * These methods will allow you to save data in localStorage, cookies, or to the window.
   * @example
   * // Pull storage off analytics instance
   * const { storage } = analytics
   *
   * // Get value
   * storage.getItem('storage_key')
   *
   * // Set value
   * storage.setItem('storage_key', 'value')
   *
   * // Remove value
   * storage.removeItem('storage_key')
   * @property getItem - Get value from storage
   * @property setItem - Set storage value
   * @property removeItem - Remove storage value
   */
  type Storage = {
      getItem: GetItem;
      setItem: SetItem;
      removeItem: RemoveItem;
  };

  /**
   * Get value from storage
   * @example
   * analytics.storage.getItem('storage_key')
   * @param key - storage key
   * @param [options] - storage options
   */
  type GetItem = (key: string, options?: any) => any;

  /**
   * Set storage value
   * @example
   * analytics.storage.setItem('storage_key', 'value')
   * @param key - storage key
   * @param value - storage value
   * @param [options] - storage options
   */
  type SetItem = (key: string, value: any, options?: any) => void;

  /**
   * Remove storage value
   * @example
   * analytics.storage.removeItem('storage_key')
   * @param key - storage key
   * @param [options] - storage options
   */
  type RemoveItem = (key: string, options?: any) => void;

  /**
   * Async reduce over matched plugin methods
   * Fires plugin functions
   */
  function processEvent(): void;

  /**
   * Return array of event names
   * @param eventType - original event type
   * @param namespace - optional namespace postfix
   * @returns - type, method, end
   */
  function getEventNames(eventType: string, namespace: string): any[];

  /**
   * Generate arguments to pass to plugin methods
   * @param instance - analytics instance
   * @param abortablePlugins - plugins that can be cancelled by caller
   * @returns function to inject plugin params
   */
  function argumentFactory(instance: any, abortablePlugins: any[]): any;

  /**
   * Verify plugin is not calling itself with whatever:myPluginName self refs
   */
  function validateMethod(): void;

  /**
   * Return the canonical URL and rmove the hash.
   * @param search - search param
   * @returns return current canonical URL
   */
  function currentUrl(search: string): string;

  /**
   * Page data for overides
   * @property [title] - Page title
   * @property [url] - Page url
   * @property [path] - Page path
   * @property [search] - Page search
   * @property [width] - Page width
   * @property [height] - Page height
   */
  interface PageDataBase {
      title?: string;
      url?: string;
      path?: string;
      search?: string;
      width?: string;
      height?: string;
  }

  /**
   * Get information about current page
   * @param [pageData = {}] - Page data overides
   */
  type getPageData = (pageData?: PageData) => PageData;

  /**
   * @property name - Name of plugin
   * @property [EVENTS] - exposed events of plugin
   * @property [config] - Configuration of plugin
   * @property [initialize] - Load analytics scripts method
   * @property [page] - Page visit tracking method
   * @property [track] - Custom event tracking method
   * @property [identify] - User identify method
   * @property [loaded] - Function to determine if analytics script loaded
   * @property [ready] - Fire function when plugin ready
   */
  interface AnalyticsPluginBase {
      name: string;
      EVENTS?: any;
      config?: any;
      initialize?: (...params: any[]) => any;
      page?: (...params: any[]) => any;
      track?: (...params: any[]) => any;
      identify?: (...params: any[]) => any;
      loaded?: (...params: any[]) => any;
      ready?: (...params: any[]) => any;
  }



  export type PageData<T extends string = string> = PageDataBase & Record<T, unknown>;
  export type AnalyticsPlugin<T extends string = string> = AnalyticsPluginBase & string extends T
    ? Record<string, unknown>
    : Record<T, unknown> & Record<string, unknown>;


  export const CONSTANTS: constants;

  export const init: typeof analytics;

  export const Analytics: typeof analytics;

  export default analytics;
}