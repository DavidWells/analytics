import { storage } from 'analytics-utils'
import { ANON_ID, USER_ID, USER_TRAITS } from '../constants'
import timeStamp from '../utils/timestamp'
import EVENTS from '../events'

export function getPersistedUserData() {
  return {
    userId: storage.getItem(USER_ID),
    anonymousId: storage.getItem(ANON_ID),
    traits: storage.getItem(USER_TRAITS) || {}
  }
}

// user reducer
export default function user(state = {}, action) {
  // Set anonymousId
  if (action && action.type === EVENTS.setItemEnd && action.key === ANON_ID) {
    return Object.assign({}, state, {
      anonymousId: action.value,
    })
  }

  switch (action.type) {
    case EVENTS.identify:
      return Object.assign({}, state, {
        userId: action.userId,
        traits: {
          ...state.traits,
          ...action.traits
        }
      })
    case EVENTS.reset:
      return Object.assign({}, state, {
        userId: null,
        anonymousId: null,
        traits: null,
      })
    default:
      return state
  }
}

export const reset = (callback) => {
  return {
    type: EVENTS.reset,
    timestamp: timeStamp(),
    callback: callback
  }
}

// Suggested Traits
/*
{
  address: {
    city: null,
    country: null,
    postalCode: null,
    state: null,
    street: null
  },
  age: 20
  avatar: 'http://url.com/thumbnail.jpg'
  birthday: 122321212,
  createdAt: 1111111,
  description: 'Description of the user',
  email: 'email@email.com',
  firstName: 'david',
  lastName: 'wells',
  name: 'david wells',
  gender: 'male',
  id: 'String Unique ID in your database for a user',
  phone: '727-777-8888',
  title: 'boss ceo',
  username: 'davidwells',
}
*/
