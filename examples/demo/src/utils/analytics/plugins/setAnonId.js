import { EVENTS, CONSTANTS } from 'analytics'
import { cookie } from 'analytics-utils'

/**
 * If user has segment anon id, set as normal anon id
 */
const setAnonymousId = store => next => action => {
  console.log('hi', EVENTS)
  if (action.type === EVENTS.SET_ITEM && action.key === CONSTANTS.ANON_ID) {
    // check for segment anonymous id
    const segmentAnonId = cookie.getCookie('ajs_anonymous_id')
    if (segmentAnonId) {
      const id = segmentAnonId.replace(/^%22/g, '').replace(/%22$/g, '')
      const updatedAction = Object.assign({}, action, { value: id })
      return next(updatedAction)
    }
  }
  return next(action)
}

export default setAnonymousId
