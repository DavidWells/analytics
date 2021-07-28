import { get } from '@analytics/global-storage-utils'
import { isObject } from '@analytics/type-utils'
import { ANON_ID, USER_ID, USER_TRAITS } from '../constants'
import { PREFIX } from '../utils/internalConstants'
import EVENTS from '../events'

/* user reducer */
export default function userReducer(storage) {
  return function user(state = {}, action = {}) {

    if (action.type === EVENTS.setItemEnd) {
      // Set anonymousId if changed by storage.setItem
      if (action.key === ANON_ID) {
        return { ...state, ...{ anonymousId: action.value }}
      }
      // Set userId if changed by storage.setItem
      if (action.key === USER_ID) {
        return { ...state, ...{ userId: action.value }}
      }
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
        // This is from default storage.removeItem: (key) => globalContext[key] = undefined
        [ USER_ID, ANON_ID, USER_TRAITS ].forEach((key) => {
          // sync storage, not instance.storage
          storage.removeItem(key)
        })
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

export function getPersistedUserData(storage) {
  return {
    userId: storage.getItem(USER_ID),
    anonymousId: storage.getItem(ANON_ID),
    traits: storage.getItem(USER_TRAITS)
  }
}

export const tempKey = (key) => PREFIX + 'TEMP' + PREFIX + key

export function getUserPropFunc(storage) {
  return function getUserProp(key, instance, payload) {
    /* 1. Try current state */
    const currentId = instance.getState('user')[key]
    if (currentId) {
      /*
      console.log(`from state ${key}`, currentId)
      /** */
      return currentId
    }

    /* 2. Try event payload */
    if (payload && isObject(payload) && payload[key]) {
      /*
      console.log(`from payload ${key}`, payload[key])
      /** */
      return payload[key]
    }

    /* 3. Try persisted data */
    const persistedInfo = getPersistedUserData(storage)[key]
    if (persistedInfo) {
      /*
      console.log(`from persistedInfo ${key}`, persistedInfo)
      /** */
      return persistedInfo
    }

    /* 4. Else, try to get in memory placeholder. TODO watch this for future issues */
    return get(tempKey(key)) || null
  }
}
