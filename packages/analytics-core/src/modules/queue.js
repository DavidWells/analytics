import EVENTS from '../events'
/*
TODO figure out if this should live in state...
Queue could be in mermory as well.
But also needs to be persisted to storage
*/

const initialState = {
  actions: [],
}

export default function queueReducer(state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case 'queue':
      let actionChain
      /* prioritize identify in event queue */
      if (payload && payload.type && payload.type === EVENTS.identify) {
        actionChain = [action].concat(state.actions)
      } else {
        actionChain = state.actions.concat(action)
      }
      return {
        ...state,
        actions: actionChain
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
