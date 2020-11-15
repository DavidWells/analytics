//////////////////
// Plugins
//////////////////

/**
 * @typedef {Object} AnalyticsPlugin
 * @property {string} name Name of plugin
 * @property {Object} [EVENTS] Exposed events of plugin
 * @property {Object} [config] Configuration of plugin
 * @property {Hook} [loaded] - Function to determine if analytics script loaded
 * @property {BootstrapHook} [bootstrap] Fires when analytics library starts up
 * @property {ParamsHook} [params] Fires when analytics parses URL parameters
 * @property {CampaignHook} [campaign] Fires if params contain "utm" parameters
 * @property {InitializeHook} [initializeStart] Fires before 'initialize', allows for plugins to cancel loading of other plugins
 * @property {InitializeHook} [initialize] Fires when analytics loads plugins
 * @property {InitializeHook} [initializeEnd] Fires after initialize, allows for plugins to run logic after initialization methods run
 * @property {ReadyHook} [ready] Fires when all analytic providers are fully loaded. This waits for 'initialize' and 'loaded' to return true
 * @property {ResetHook} [resetStart] Fires if analytic.reset() is called.
 * @property {ResetHook} [reset] Fires if analytic.reset() is called.
 * @property {ResetHook} [resetEnd] Fires after analytic.reset() is called.
 * @property {PageHook} [pageStart] Fires before 'page' events fire.
 * @property {PageHook} [page] Core analytics hook for page views.
 * @property {PageHook} [pageEnd] Fires after all registered 'page' methods fire.
 * @property {PageHook} [pageAborted] Fires if 'page' call is cancelled by a plugin
 * @property {TrackHook} [trackStart] Called before the 'track' events fires.
 * @property {TrackHook} [track] Core analytics hook for event tracking.
 * @property {TrackHook} [trackEnd] Fires after all registered 'track' events fire from plugins.
 * @property {TrackHook} [trackAborted] Fires if 'track' call is cancelled by a plugin
 * @property {IdentifyHook} [identifyStart] Called before the 'identify' events fires.
 * @property {IdentifyHook} [identify] Core analytics hook for user identification.
 * @property {IdentifyHook} [identifyEnd] Fires after all registered 'identify' events fire from plugins.
 * @property {IdentifyHook} [identifyAborted] Fires if 'identify' call is cancelled by a plugin
 * @property {UserIdChangedHook} [userIdChanged] Fires when a user id is updated
 * @property {RegisterPluginsHook} [registerPlugins] Fires when analytics is registering plugins
 * @property {EnablePluginHook} [enablePlugin] Fires when 'analytics.enablePlugin()' is called
 * @property {EnablePluginHook} [disablePlugin] Fires when 'analytics.disablePlugin()' is called
 * @property {EnablePluginHook} [loadPlugin] Fires when 'analytics.loadPlugin()' is called
 * @property {EmptyHook} [online] Fires when browser network goes online.
 * @property {EmptyHook} [offline] Fires when browser network goes offline.
 * @property {SetItemHook} [setItemStart] Fires when analytics.storage.setItem is initialized.
 * @property {SetItemHook} [setItem] Fires when analytics.storage.setItem is called.
 * @property {SetItemHook} [setItemEnd] Fires when setItem storage is complete.
 * @property {SetItemHook} [setItemAborted] Fires when setItem storage is cancelled by a plugin.
 * @property {RemoveItemHook} [removeItemStart] Fires when analytics.storage.removeItem is initialized.
 * @property {RemoveItemHook} [removeItem] Fires when analytics.storage.removeItem is called.
 * @property {RemoveItemHook} [removeItemEnd] Fires when removeItem storage is complete.
 * @property {RemoveItemHook} [removeItemAborted] Fires when removeItem storage is cancelled by a plugin.
 */

/**
 * @typedef {Object} PluginState State of a plugin
 * @property {Object} [config] Configuration of plugin
 * @property {Boolean} enabled Whether plugin is enabled
 * @property {Boolean} initialized Whether plugin is initialized
 * @property {Boolean} loaded Whether plugin is loaded
 */

/**
  * @typedef {Function} Abort
  * @returns  {void}
  */

//////////////////
// Hooks
//////////////////

// Hooks - Generic

/**
 * @typedef {Object} PayloadBase
 * @property {String} type - Event type
 */

/**
 * @typedef {PayloadBase} EmptyPayload
 */

/**
 * @typedef {Object} EmptyContextProps
 * @property {PayloadBase} payload Empty payload in hook
 */

 /**
 * @typedef {HookContextCommon & EmptyContextProps} EmptyContext Context with empty payload passed to a hook
 */

 /**
 * @typedef {Function} EmptyHook
 * @param  {EmptyContext} context Context with empty payload passed to a base hook
 */

/**
  * @typedef {Object} HookContextBase Base of the context passed to a generic plugin hook
  * @property  {string} hello Name of current plugin
  * @property  {AnalyticsInstance} instance Analytics instance
  * @property  {Object} [config] Configuration of plugin
  */

/**
  * @typedef {Object} HookContextPropsCommon
  * @property  {Object.<string, PluginState>} plugins Name of plugins(s) to disable
  * @property  {Abort} abort Name of plugins(s) to disable
  */

/**
  * @typedef {HookContextBase & HookContextPropsCommon} HookContextCommon
  */

/**
 * @typedef {PayloadBase} HookPayload Payload in any hook
 */

/**
  * @typedef {Object} HookContextProps
  * @property {Object} payload Payload in any hook
  */

/**
  * @typedef {HookContextCommon & HookContextProps} HookContext Context passed to a generic plugin hook
  * @property  {Object} payload Name of plugins(s) to disable
  */

/**
 * @typedef {Function} Hook Generic hook on the AnalyticsPlugin object.
 * @param  {HookContext} context Context passed to a plugin hook
 */

// Hooks - Bootstrap

/**
 * @typedef {AnalyticsPlugin} BootstrapPayload Payload in any hook
 */

/**
 * @typedef {Object} BootstrapContextProps Context passed to bootstrap hook
 * @property {BootstrapPayload} payload Analytics plugin
 */

 /**
 * @typedef {HookContextCommon & BootstrapContextProps} BootstrapContext Context passed to bootstrap hook
 */

 /**
 * @typedef {Function} BootstrapHook
 * @param  {BootstrapContext} context Context passed to bootstrap hook
 * @returns  {void}
 */

// Hooks - Params

/**
 * @typedef {Object} ParamsPayloadProps Payload in params hook
 * @property {Object.<string, string>} raw Raw search params
 * @property {Object.<string, string>} props Props search params
 * @property {Object.<string, string>} traits Traits search params
 * @property {String} [userId] User ID.
 */

 /**
 * @typedef {PayloadBase & CampaignPayloadProps & ParamsPayloadProps} ParamsPayload Payload in params hook
 */

 /**
 * @typedef {Object} ParamsContextProps
 * @property {ParamsPayload} payload Payload in params hook
 */

 /**
 * @typedef {HookContextCommon & ParamsContextProps} ParamsContext Context passed to params hook
 */

 /**
 * @typedef {Function} ParamsHook
 * @param  {ParamsContext} context Context passed to params hook
 */

// Hooks - Campaign

/**
 * @typedef {Object} CampaignPayloadProps
 * @property {Object.<string, string>} campaign UTM search params
 */

 /**
 * @typedef {PayloadBase & CampaignPayloadProps} CampaignPayload Payload in campaign hook
 */

 /**
 * @typedef {Object} CampaignContextProps
 * @property {CampaignPayload} payload Payload in campaign hook
 */

 /**
 * @typedef {HookContextCommon & CampaignContextProps} CampaignContext Context passed to campaign hook
 */

 /**
 * @typedef {Function} CampaignHook
 * @param  {CampaignContext} context Context passed to campaign hook
 */

// Hooks - Initialize

/**
 * @typedef {Object} InitializePayloadProps
 * @property {Array.<string>} plugins Names of plugins
 */

 /**
 * @typedef {PayloadBase & InitializePayloadProps} InitializePayload Payload in initialize hook
 */

 /**
 * @typedef {Object} InitializeContextProps
 * @property {InitializePayload} payload Payload in initialize hook
 */

 /**
 * @typedef {HookContextCommon & InitializeContextProps} InitializeContext Context passed to initialize hook
 */

 /**
 * @typedef {Function} InitializeHook
 * @param  {InitializeContext} context Context passed to initialize hook
 */

// Hooks - Ready

/**
 * @typedef {Object} ReadyPayloadProps
 * @property {Array.<string>} failed Names of failed plugins
 */

 /**
 * @typedef {PayloadBase & InitializePayloadProps & ReadyPayloadProps} ReadyPayload Payload in ready hook
 */

 /**
 * @typedef {Object} ReadyContextProps
 * @property {ReadyPayload} payload Payload in ready hook
 */

 /**
 * @typedef {HookContextCommon & ReadyContextProps} ReadyContext Context passed to ready hook
 */

/**
 * @typedef {Function} ReadyHook
 * @param  {ReadyContext} context Context passed to ready hook
 */

// Hooks - Reset

/**
 * @typedef {Object} ResetPayloadProps
 * @property {Number} timestamp
 * @property {Function} callback
 */

 /**
 * @typedef {PayloadBase & ResetPayloadProps} ResetPayload Payload in reset hook
 */

 /**
 * @typedef {Object} ResetContextProps
 * @property {ResetPayload} payload Payload in reset hook
 */

 /**
 * @typedef {HookContextCommon & ResetContextProps} ResetContext Context passed to reset hook
 */

 /**
 * @typedef {Function} ResetHook
 * @param  {ResetContext} context Context passed to reset hook
 */

// Hooks - Page

/**
 * @typedef {Object} PagePayloadProps
 * @property {String} anonymousId
 * @property {String} userId
 * @property {ResetPayloadProps} meta
 * @property {Object} properties
 * @property {Object} options
 */

 /**
 * @typedef {PayloadBase & PagePayloadProps} PagePayload Payload in page hook
 */

 /**
 * @typedef {Object} PageContextProps
 * @property {PagePayload} payload Payload in page hook
 */

 /**
 * @typedef {HookContextCommon & PageContextProps} PageContext Context passed to page hook
 */

 /**
 * @typedef {Function} PageHook
 * @param  {PageContext} context Context passed to page hook
 */

// Hooks - Track

/**
 * @typedef {Object} TrackPayloadProps
 * @property {String} anonymousId
 * @property {String} userId
 * @property {String} event
 * @property {ResetPayloadProps} meta
 * @property {Object} properties
 * @property {Object} options
 */

 /**
 * @typedef {PayloadBase & TrackPayloadProps} TrackPayload Payload in track hook
 */

 /**
 * @typedef {Object} TrackContextProps
 * @property {TrackPayload} payload Payload in track hook
 */

 /**
 * @typedef {HookContextCommon & TrackContextProps} TrackContext Context passed to track hook
 */

 /**
 * @typedef {Function} TrackHook
 * @param  {TrackContext} context Context passed to track hook
 */

// Hooks - Identify

/**
 * @typedef {Object} IdentifyPayloadProps
 * @property {String} anonymousId
 * @property {String} userId
 * @property {ResetPayloadProps} meta
 * @property {Object} traits
 * @property {Object} options
 */

 /**
 * @typedef {PayloadBase & IdentifyPayloadProps} IdentifyPayload Payload in identify hook
 */

 /**
 * @typedef {Object} IdentifyContextProps
 * @property {IdentifyPayload} payload Payload in identify hook
 */

 /**
 * @typedef {HookContextCommon & IdentifyContextProps} IdentifyContext Context passed to identify hook
 */

 /**
 * @typedef {Function} IdentifyHook
 * @param  {IdentifyContext} context Context passed to identify hook
 */

// Hooks - UserIdChanged

/**
 * @typedef {Object} UserIdChangedState
 * @property {String} userId
 * @property {Object} traits
 */

 /**
 * @typedef {Object} UserIdChangedPayloadProps
 * @property {UserIdChangedState} new
 * @property {UserIdChangedState} old
 * @property {Object} options
 */

 /**
 * @typedef {PayloadBase & UserIdChangedPayloadProps} UserIdChangedPayload Payload in userIdChanged hook
 */

 /**
 * @typedef {Object} UserIdChangedContextProps
 * @property {UserIdChangedPayload} payload Payload in userIdChanged hook
 */

 /**
 * @typedef {HookContextCommon & UserIdChangedContextProps} UserIdChangedContext Context passed to userIdChanged hook
 */

 /**
 * @typedef {Function} UserIdChangedHook
 * @param  {UserIdChangedContext} context Context passed to userIdChanged hook
 */

// Hooks - RegisterPlugins

/**
 * @typedef {Object} RegisterPluginsPayloadProps
 * @property {Array.<String>} plugins
 */

 /**
 * @typedef {PayloadBase & RegisterPluginsPayloadProps} RegisterPluginsPayload Payload in RegisterPlugins hook
 */

 /**
 * @typedef {Object} RegisterPluginsContextProps
 * @property {RegisterPluginsPayload} payload Payload in registerPlugins hook
 */

 /**
 * @typedef {HookContextCommon & RegisterPluginsContextProps} RegisterPluginsContext Context passed to registerPlugins hook
 */

 /**
 * @typedef {Function} RegisterPluginsHook
 * @param  {RegisterPluginsContext} context Context passed to registerPlugins hook
 */

// Hooks - EnablePlugin

/**
 * @typedef {Object} EnablePluginPayloadProps
 * @property {Function} [callback]
 * @property {String} name
 */

 /**
 * @typedef {PayloadBase & EnablePluginPayloadProps} EnablePluginPayload Payload in enablePlugin hook
 */

 /**
 * @typedef {Object} EnablePluginContextProps
 * @property {EnablePluginPayload} payload Payload in enablePlugin hook
 */

 /**
 * @typedef {HookContextCommon & EnablePluginContextProps} EnablePluginContext Context passed to enablePlugin hook
 */

 /**
 * @typedef {Function} EnablePluginHook
 * @param  {EnablePluginContext} context Context passed to enablePlugin hook
 */

// Hooks - RemoveItem

/**
 * @typedef {Object} RemoveItemPayloadProps
 * @property {String} key
 * @property {Number} timestamp
 * @property {Object} [options]
 */

 /**
 * @typedef {PayloadBase & RemoveItemPayloadProps} RemoveItemPayload Payload in removeItem hook
 */

 /**
 * @typedef {Object} RemoveItemContextProps
 * @property {RemoveItemPayload} payload Payload in removeItem hook
 */

 /**
 * @typedef {HookContextCommon & RemoveItemContextProps} RemoveItemContext Context passed to removeItem hook
 */

 /**
 * @typedef {Function} RemoveItemHook
 * @param  {RemoveItemContext} context Context passed to removeItem hook
 */

// Hooks - SetItem

/**
 * @typedef {Object} SetItemPayloadProps
 * @property {*} [value]
 */

 /**
 * @typedef {PayloadBase & RemoveItemPayloadProps & SetItemPayloadProps} SetItemPayload Payload in setItem hook
 */

 /**
 * @typedef {Object} SetItemContextProps
 * @property {SetItemPayload} payload Payload in setItem hook
 */

 /**
 * @typedef {HookContextCommon & SetItemContextProps} SetItemContext Context passed to setItem hook
 */

 /**
 * @typedef {Function} SetItemHook
 * @param  {SetItemContext} context Context passed to setItem hook
 */
