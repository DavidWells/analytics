import { uuid, storage } from 'analytics-utils'
import { ANON_ID, USER_ID, USER_TRAITS } from '../constants'
import EVENTS from '../events'

const { getItem, setItem } = storage

const setId = () => {
  const id = uuid()
  setItem(ANON_ID, id)
  return id
}

// user state
const initialState = {
  userId: getItem(USER_ID),
  anonymousId: getItem(ANON_ID) || setId(),
  traits: getItem(USER_TRAITS) || {}
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
    type: EVENTS.IDENTIFY_INIT,
    userId: userId,
    traits: traits,
    options: options,
    callback: callback
  }
}
