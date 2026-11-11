export interface GoogleTagManagerConfig {
  /** The GTM container ID, for example GTM-123xyz */
  containerId: string
  /** Whether analytics should enable this plugin on initialization */
  enabled?: boolean
  /** Log events pushed to the data layer */
  debug?: boolean
  /** The data layer object name; defaults to dataLayer */
  dataLayerName?: string
  dataLayer?: unknown[]
  customScriptSrc?: string
  preview?: string
  auth?: string
  /** Script loading mode; defaults to async */
  execution?: string
  /** Content-Security-Policy nonce for the injected script */
  nonce?: string
}

export interface GoogleTagManagerPlugin {
  name: 'google-tag-manager'
  // node returns a no-op plugin without the browser configuration or lifecycle methods
  config?: GoogleTagManagerConfig
  loaded?: () => boolean
  [key: string]: unknown
}

export default function googleTagManager(config: GoogleTagManagerConfig): GoogleTagManagerPlugin
