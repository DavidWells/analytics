// Follows ducks pattern http://bit.ly/2DnERMc
import EVENTS from '../events'

/**
 * TODO figure out if this should live in state...
 *
 * Queue could be in mermory as well.
 *
 * But also needs to be persisted to storage
 */

const initialState = {
  actions: [],
}

export default function queueReducer(state = initialState, action) {
  const { type, data, timestamp } = action

  switch (type) {
    case 'queue':
      return {
        ...state,
        actions: state.actions.concat(action)
      }
    case 'dequeue':
      return []
    // todo push events to history
    default:
      return state
  }
}

export const queueAction = (data, timestamp) => {
  return {
    type: 'queue',
    timestamp: timestamp,
    data: data
  }
}
