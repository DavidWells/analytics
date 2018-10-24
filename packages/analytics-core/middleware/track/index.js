import EVENTS from '../../events'
import formatPayload from './formatPayload'
import getIntegrationsWithMethod from '../../utils/getIntegrationsWithMethod'
import getCallbackFromArgs from '../../utils/getCallback'

export default function trackMiddleware(getIntegrations) {
  return store => next => action => {
    const { type, eventName, data, options, callback } = action
    if (type === EVENTS.TRACK_START) {
      // format data payload
      const payload = formatPayload(eventName, data)
      // setup data
      const dispatchData = {
        eventName: eventName,
        payload: payload,
        options: options
      }

      // if abort === true stop the rest
      if (action.abort) {
        store.dispatch({
          ...{ type: EVENTS.TRACK_ABORT },
          ...dispatchData
        })
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
      let hasRan = false

      /* Filter out disabled integrations */
      trackCalls.filter((provider) => {
        const integrations = options && options.integrations
        const disabled = integrations && integrations[provider.NAMESPACE] === false
        if (disabled) {
          console.log('ABORT TRACK>>>>>', provider.NAMESPACE, type)
        }
        return !disabled
      /* Handle all .track calls */
      }).forEach((provider) => {
        const { NAMESPACE } = provider
        // check for ready state on integration and recursively call til rdy
        let timeoutMax = 10000
        let timer = 0
        const runTrackWhenLibraryLoaded = () => {
          const state = store.getState()
          // enrich options
          const enrichedOptions = { ...state, ...{ options: options } }

          const integrationLoaded = state.integrations[NAMESPACE].loaded
          if (!integrationLoaded) {
            // TODO: set max try limit and add calls to local queue on fail
            if (timer > timeoutMax) {
              store.dispatch({
                ...dispatchData,
                ...{ type: 'trackingTimeout' }
              })
              // TODO: save to queue
              return false
            }
            timer = timer + 10
            setTimeout(runTrackWhenLibraryLoaded, 10)
            return false
          }

          /* run integration[x] .track function */
          provider.track(eventName, payload, enrichedOptions, state)

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
              type: `track:${NAMESPACE}`,
              integration: NAMESPACE,
            },
            ...dispatchData
          })
          // increment success counter
          trackCount = trackCount + 1
          // all track calls complete
          if (trackCount === trackCalls.length) {
            const cb = getCallbackFromArgs(data, options, callback)
            if (cb) cb(state)
            // dispatch completion event for middlewares
            store.dispatch({
              ...{ type: EVENTS.TRACK_COMPLETE },
              ...dispatchData
            })
          }
        }
        runTrackWhenLibraryLoaded()
      })
    }
    return next(action)
  }
}
