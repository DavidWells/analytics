import { uuid, isObject, globalContext } from 'analytics-utils'
import { ANON_ID, USER_ID, USER_TRAITS } from '../constants'
import { ID, ANONID } from '../utils/internalConstants'
import EVENTS from '../events'

/* user reducer */
export default function userReducer(storage) {
  return function user(state = {}, action) {
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
        // Side effect to fix race condition in Node. TODO refactor
        [ ID, ANONID, 'traits' ].forEach((key) => {
          globalContext[tempKey(key)] = null
        });
        [ USER_ID, ANON_ID, USER_TRAITS ].forEach((key) => {
          storage.removeItem(key)
        });

        return Object.assign({}, state, {
          userId: null,
          // TODO reset anon id automatically?
          anonymousId: null,
          traits: {},
        })
      default:
        return state
    }
  }
}

export function getPersistedUserData(params, storage) {
  return {
    userId: storage.getItem(USER_ID) || params.an_uid,
    anonymousId: storage.getItem(ANON_ID) || params.an_aid || uuid(),
    traits: storage.getItem(USER_TRAITS) || {}
  }
}

export const tempKey = (key) => '__TEMP__' + key

export function getUserPropFunc(storage) {
  return function getUserProp(key, instance, payload) {
    /* 1. Try current state */
    const currentId = instance.getState('user')[key]
    if (currentId) {
      // console.log('from state', currentId)
      return currentId
    }

    /* 2. Try event payload */
    if (payload && isObject(payload) && payload[key]) {
      // console.log('from payload', payload[key])
      return payload[key]
    }

    /* 3. Try persisted data */
    const persistedInfo = getPersistedUserData({}, storage)[key]
    if (persistedInfo) {
      // console.log('from persistedInfo', persistedInfo)
      return persistedInfo
    }

    /* 4. Else, try to get in memory placeholder. TODO watch this for future issues */
    if (globalContext[tempKey(key)]) {
      // console.log('from global', globalContext[tempKey(key)])
      return globalContext[tempKey(key)]
    }
    // return null instead of undefined for consistency
    return null
  }
}
