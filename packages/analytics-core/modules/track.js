// Track Module
import EVENTS from '../events'
import getIntegrationsWithMethod from '../utils/getIntegrationsWithMethod'
import getCallbackFromArgs from '../utils/getCallback'

// Track State
const initialState = {
  event: {},
  lastEvent: null,
  history: [],
}

// track reducer
export default function trackReducer(state = initialState, action) {
  const { type, data, eventName } = action

  switch (type) {
    case EVENTS.TRACK:
      const l = (!state.lastEvent) ? data : state.event
      // console.log('>>>>>>>>>>>> state.lastEvent', state.lastEvent)
      // TODO fix last event. 9/25 Still need to fix
      return {
        ...state,
        ...{
          event: data,
          lastEvent: l
        }
      }
    // todo push events to history
    default:
      return state
  }
}

// // Set tracking data for third party plugins
export const trackEvent = (eventName, data, options, callback) => {
  return {
    type: EVENTS.TRACK_INIT,
    eventName: eventName,
    data: data,
    options: options,
    callback: callback
  }
}
