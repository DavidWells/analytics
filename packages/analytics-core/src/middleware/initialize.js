/* eslint-disable camelcase */
import EVENTS from '../events'
import { ANON_ID, USER_ID, USER_TRAITS } from '../constants'

const utmRegex = /^utm_/
const propRegex = /^an_prop_/
const traitRegex = /^an_trait_/

// Middleware runs during EVENTS.initialize
export default function initializeMiddleware(instance) {
  const { setItem } = instance.storage
  return store => next => action => {
    /* Handle bootstrap event */
    if (action.type === EVENTS.bootstrap) {
      const { params, user, persistedUser, initialUser } = action
      const isKnownId = persistedUser.userId === user.userId
      /* 1. Set anonymous ID */
      if (persistedUser.anonymousId !== user.anonymousId) {
        setItem(ANON_ID, user.anonymousId)
      }
      /* 2. Set userId */
      if (!isKnownId) {
        setItem(USER_ID, user.userId)
      }
      /* 3. Set traits if they are different */
      if (initialUser.traits) {
         setItem(USER_TRAITS, {
          ...(isKnownId && persistedUser.traits) ? persistedUser.traits : {},
          ...initialUser.traits
        })
        /* TODO multi user setup
        setItem(`${USER_TRAITS}.${user.userId}`, {
          ...(isKnownId) ? existingTraits : {},
          ...initialUser.traits
        })
        */
      }
      /* 4. Parse url params */
      const paramsArray = Object.keys(action.params)
      if (paramsArray.length) {
        const { an_uid, an_event } = params
        const groupedParams = paramsArray.reduce((acc, key) => {
          // match utm params & dclid (display) & gclid (cpc)
          if (key.match(utmRegex) || key.match(/^(d|g)clid/)) {
            const cleanName = key.replace(utmRegex, '')
            const keyName = (cleanName === 'campaign') ? 'name' : cleanName
            acc.campaign[keyName] = params[key]
          }
          if (key.match(propRegex)) {
            acc.props[key.replace(propRegex, '')] = params[key]
          }
          if (key.match(traitRegex)) {
            acc.traits[key.replace(traitRegex, '')] = params[key]
          }
          return acc
        }, {
          campaign: {},
          props: {},
          traits: {}
        })

        store.dispatch({
          type: EVENTS.params,
          raw: params,
          ...groupedParams,
          ...(an_uid ? { userId: an_uid } : {}),
        })

        /* If userId set, call identify */
        if (an_uid) {
          // timeout to debounce and make sure integration is registered. Todo refactor
          setTimeout(() => instance.identify(an_uid, groupedParams.traits), 0)
        }

        /* If tracking event set, call track */
        if (an_event) {
          // timeout to debounce and make sure integration is registered. Todo refactor
          setTimeout(() => instance.track(an_event, groupedParams.props), 0)
        }

        // if url has utm params
        if (Object.keys(groupedParams.campaign).length) {
          store.dispatch({
            type: EVENTS.campaign,
            campaign: groupedParams.campaign
          })
        }
      }
    }
    return next(action)
  }
}
