import EVENTS from '../events'
import urlParams from '../utils/getUrlParams'

// Middleware runs during EVENTS.INITIALIZE
const initialize = store => next => action => {
  if (action.type === EVENTS.INITIALIZE) {
    const params = urlParams()
    if (params) {
      store.dispatch({
        type: EVENTS.HANDLE_PARAMS,
        params: params
      })

      const utmParams = Object.keys(params).reduce((arr, key) => {
        if (key.match(/utm_/)) arr[key] = params[key]
        return arr
      }, {})

      // if url has utm params
      if (Object.keys(utmParams).length) {
        store.dispatch({
          type: EVENTS.SET_CAMPAIGN,
          campaign: utmParams
        })
      }
    }
    // handle user indenfication here

    // handle initial visitor source here
  }
  return next(action)
}
export default initialize
