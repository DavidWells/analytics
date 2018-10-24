// Core Analytic Events

export default {
  INITIALIZE: 'analyticsInit', // 'analyticsInit'
  HANDLE_PARAMS: 'params',
  SET_CAMPAIGN: 'campaign',
  READY: 'ready', // 'analyticsReady'
  /* Integration actions */
  REGISTER_INTEGRATION: 'integration_init', // 'integrationInit'
  INTEGRATION_LOADED: 'integration_ready', // 'integrationLoaded'
  INTEGRATION_FAILED: 'integration_failed', // 'integrationFailed'
  ENABLE_INTEGRATION: 'enable_integration', // 'integrationEnabled'
  DISABLE_INTEGRATION: 'disable_integration', // 'integrationDisabled'
  /* Page actions */
  PAGE_START: 'page_init', // 'pageInit'
  PAGE: 'page', // 'page'
  PAGE_COMPLETE: 'page_complete', // 'pageCompleted'
  PAGE_ABORT: 'page_abort', // 'pageAborted' // TODO add this
  /* Track actions */
  TRACK_START: 'track_init', // 'trackInit'
  TRACK: 'track', // 'track'
  TRACK_COMPLETE: 'track_complete', // 'trackCompleted'
  TRACK_ABORT: 'track_abort', // 'trackAborted'
  /* Identify actions */
  IDENTIFY_START: 'identify_init', // 'identifyInit'
  IDENTIFY: 'identify', // 'identify'
  IDENTIFY_COMPLETE: 'identify_complete', // 'identifyCompleted'
  IDENTIFY_ABORTED: 'identify_abort' // 'identifyAborted' // TODO add this
}
