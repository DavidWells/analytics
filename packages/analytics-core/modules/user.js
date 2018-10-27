import { uuid, inBrowser } from 'analytics-utils'
import EVENTS from '../events'

// TODO come up with ls keys
const ANALYTICS_ID = 'analytics_id'

const setId = () => {
  const id = uuid()
  if (!inBrowser) {
    return id
  }
  // TODO refactor with persistance options https://github.com/harrysolovay/state-mint/tree/master/src/persistence/methods
  localStorage.setItem(ANALYTICS_ID, id)
  return id
}

const getId = () => {
  if (!inBrowser) {
    return null
  }
  return localStorage.getItem(ANALYTICS_ID)
}

const deleteId = () => {
  if (!inBrowser) {
    return null
  }
  return localStorage.removeItem(ANALYTICS_ID)
}

const initializeId = () => {
  const id = getId()
  return id || setId()
}

// user state
const initialState = {
  userId: null,
  anonymousId: initializeId(),
  traits: {}
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

// user reducer
export default function user(state = initialState, action) {
  switch (action.type) {
    case EVENTS.IDENTIFY:
      return Object.assign({}, state, {
        userId: action.userId,
        traits: {
          ...state.traits,
          ...action.traits
        }
      })
    default:
      return state
  }
}

// Set tracking data for third party plugins
export const identify = (userId, traits, options, callback) => {
  return {
    type: EVENTS.IDENTIFY_START,
    userId: userId,
    traits: traits,
    options: options,
    callback: callback
  }
}
