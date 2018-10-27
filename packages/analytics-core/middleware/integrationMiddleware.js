import EVENTS from '../events'

/* run enable/disable integration callback if one is provided */
/*
analytics.disableIntegration('vanilla', () => {
  console.log('my callback')
})
*/
const integrationMiddleware = store => next => action => {
  const { type, name, callback } = action
  if (type === EVENTS.DISABLE_INTEGRATION || type === EVENTS.ENABLE_INTEGRATION) {
    if (callback) {
      callback(name)
    }
  }
  return next(action)
}

export default integrationMiddleware
