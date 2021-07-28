// Track Module. Follows ducks pattern http://bit.ly/2DnERMc
import EVENTS from '../events'
import serialize from '../utils/serialize'

// Track State
const initialState = {
  last: {},
  history: [],
}

// track reducer
export default function trackReducer(state = initialState, action) {
  const { type, event, properties, options, meta } = action

  switch (type) {
    case EVENTS.track:
      const trackEvent = serialize({
        event,
        properties,
        ...(Object.keys(options).length) && { options: options },
        meta
      })
      return {
        ...state,
        ...{
          last: trackEvent,
          // Todo prevent LARGE arrays https://bit.ly/2MnBwPT
          history: state.history.concat(trackEvent)
        }
      }
    default:
      return state
  }
}
