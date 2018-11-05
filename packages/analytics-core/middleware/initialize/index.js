import EVENTS from '../../events'
import { identify } from '../../modules/user'
import { trackEvent } from '../../modules/track'
import { paramsParse, paramsRemove } from 'analytics-utils'

// Middleware runs during EVENTS.INITIALIZE
const initializeMiddleware = store => next => action => {
  if (action.type === EVENTS.INITIALIZE) {
    // 1. Set anonymous ID

    // 2. Parse params

    const params = paramsParse()
    const paramsArray = Object.keys(params)
    if (paramsArray.length) {
      store.dispatch({
        type: EVENTS.HANDLE_PARAMS,
        params: params
      })

      // parse params
      const groupedParams = paramsArray.reduce((acc, key) => {
        if (key.match(/^utm_/)) {
          acc.utm[key] = params[key]
        }
        if (key.match(/^an_prop_/)) {
          acc.props[`${key.replace(/^an_prop_/, '')}`] = params[key]
        }
        if (key.match(/^an_trait_/)) {
          acc.traits[`${key.replace(/^an_trait_/, '')}`] = params[key]
        }
        return acc
      }, {
        utm: {},
        props: {},
        traits: {}
      })

      if (params.an_uid) {
        console.log('DO identity call', params.an_uid)
        // timeout to debounce and make sure integration is registered. Todo refactor
        setTimeout(() => {
          // Dispatch identify call
          store.dispatch(identify(params.an_uid, groupedParams.traits))
        }, 0)
      }

      if (params.an_event) {
        // timeout to debounce and make sure integration is registered. Todo refactor
        setTimeout(() => {
          store.dispatch(
            // Dispatch track call
            trackEvent(params.an_event, groupedParams.props)
          )
        }, 0)
      }

      // if url has utm params
      if (Object.keys(groupedParams.utm).length) {
        store.dispatch({
          type: EVENTS.SET_CAMPAIGN,
          campaign: groupedParams.utm
        })
      }

      if (params.an_clean) {
        console.log('RUN CLEAN')
        // timeout to debounce and make sure integration is registered. Todo refactor
        setTimeout(() => {
          paramsRemove('an_')
        }, 0)
      }
    }
    // handle user indenfication here

    // handle initial visitor source here
  }
  return next(action)
}

export default initializeMiddleware
