import EVENTS from '../../events'
import formatPayload from './formatPayload'
import getIntegrationsWithMethod from '../../utils/getIntegrationsWithMethod'
import getCallbackFromArgs from '../../utils/getCallback'
import filterDisabled from '../../utils/filterDisabled'

export default function trackMiddleware(getIntegrations, getState) {
  return store => next => action => {
    const { type, eventName, data, options, callback } = action
    if (type === EVENTS.TRACK_INIT) {
      const dataObject = (data && typeof data === 'object') ? data : {}
      const cb = getCallbackFromArgs(data, options, callback)
      // format data payload
      const payload = formatPayload(eventName, dataObject)
      // setup data
      const dispatchData = {
        eventName: eventName,
        payload: payload,
        options: options
      }

      // if abort === true stop the rest
      if (action.abort || !eventName || typeof eventName !== 'string') {
        // Todo add reason why aborting happened
        store.dispatch({
          ...{ type: EVENTS.TRACK_ABORT },
          ...dispatchData
        })
        if (!eventName) {
          console.log('Missing eventName')
        }
        if (typeof eventName !== 'string') {
          console.log('eventName is malformatted')
        }
        return next(action)
      }

      const trackCalls = getIntegrationsWithMethod(getIntegrations(), 'track')

      // No tracking middleware attached
      if (!trackCalls.length) {
        store.dispatch({
          ...{ type: EVENTS.TRACK },
          ...dispatchData
        })
        return store.dispatch({
          ...{ type: EVENTS.TRACK_COMPLETE },
          ...dispatchData
        })
      }

      let trackCount = 0
      let completed = []
      let hasRan = false
      /* Filter out disabled integrations */
      filterDisabled(trackCalls, options).forEach((provider) => {
        const { NAMESPACE } = provider
        // check for ready state on integration and recursively call til rdy
        let timeoutMax = 10000
        let timer = 0
        const runTrackWhenLibraryLoaded = () => {
          const state = store.getState()
          const { loaded, enabled } = state.integrations[NAMESPACE]
          // enrich options
          const enrichedOptions = { ...state, ...{ options: options } }
          // get callback from args passed in

          // Integration not enabled abort call
          if (!enabled) {
            // console.log('ABORT TRACK 2>>>>>', provider.NAMESPACE, type)
            trackCount = trackCount + 1
            // all track calls complete
            if (trackCount === trackCalls.length) {
              // Todo this logic is duplicated above in after abort
              trackCompleted(dispatchData, state, completed, store, cb)
            }
            return false
          }

          if (!loaded) {
            // TODO: set max try limit and add calls to local queue on fail
            if (timer > timeoutMax) {
              // TODO send the event data with timestamp to `failedTrackCall` key?
              store.dispatch({
                ...dispatchData,
                ...{
                  type: EVENTS.TRACK_TIME_OUT,
                  integration: NAMESPACE
                }
              })
              // TODO: save to retry queue

              trackCompleted(dispatchData, state, completed, store, cb)
              return false
            }
            timer = timer + 10
            setTimeout(runTrackWhenLibraryLoaded, 10)
            return false
          }

          /* run integration[x] .track function */
          provider.track(eventName, payload, enrichedOptions, getState)

          if (state.context.debug) {
            console.log('DEBUG IS ONNNNNNNNNN')
          }

          if (!hasRan) {
            store.dispatch({
              ...{ type: EVENTS.TRACK },
              ...dispatchData
            })
            hasRan = true
          }
          // dispatch call for middlewares
          store.dispatch({
            ...{
              type: EVENTS.TRACK_NAMESPACE(NAMESPACE)
            },
            ...dispatchData
          })

          completed = completed.concat(NAMESPACE)
          // increment success counter
          trackCount = trackCount + 1
          // all track calls complete
          if (trackCount === trackCalls.length) {
            // Todo this logic is duplicated above in after abort
            trackCompleted(dispatchData, state, completed, store, cb)
          }
        }
        runTrackWhenLibraryLoaded()
      })
    }
    return next(action)
  }
}

function trackCompleted(dispatchData, state, completed, store, cb) {
  if (cb) {
    cb(state)
  }
  // dispatch completion event for middlewares
  store.dispatch({
    ...{ type: EVENTS.TRACK_COMPLETE },
    ...dispatchData,
    ...{ integrations: completed }
  })
}
