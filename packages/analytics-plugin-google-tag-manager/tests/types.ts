import googleTagManager, { GoogleTagManagerConfig, GoogleTagManagerPlugin } from '..'

const config: GoogleTagManagerConfig = {
  containerId: 'GTM-123xyz',
  enabled: false,
  debug: true,
  dataLayerName: 'customDataLayer',
  dataLayer: [],
  customScriptSrc: 'https://example.com/gtm.js',
  preview: 'env-1',
  auth: 'preview-auth',
  execution: 'defer',
  nonce: 'script-nonce'
}

const plugin: GoogleTagManagerPlugin = googleTagManager(config)
const name: 'google-tag-manager' = plugin.name
googleTagManager({ containerId: 'GTM-123xyz' })

type Assert<T extends true> = T
type ConfigIsRequired = Assert<[] extends Parameters<typeof googleTagManager> ? false : true>
type ContainerIdIsRequired = Assert<{} extends GoogleTagManagerConfig ? false : true>
type ContainerIdMustBeString = Assert<{ containerId: number } extends GoogleTagManagerConfig ? false : true>
type EnabledMustBeBoolean = Assert<{ containerId: string; enabled: string } extends GoogleTagManagerConfig ? false : true>
