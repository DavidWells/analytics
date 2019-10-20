/* eslint-disable camelcase */
import { paramsParse, storage, uuid } from 'analytics-utils'
import EVENTS from '../events'
import { ANON_ID } from '../constants'

const utmRegex = /^utm_/
const propRegex = /^an_prop_/
const traitRegex = /^an_trait_/

// Middleware runs during EVENTS.initialize
export default function initializeMiddleware(instance) {
  return store => next => action => {
    if (action.type === EVENTS.bootstrap) {
      const params = paramsParse()
      /* 1. Set anonymous ID */
      if (!storage.getItem(ANON_ID)) {
        const anonId = params.an_aid || uuid()
        instance.storage.setItem(ANON_ID, anonId)
      }
      /* 2. Parse url params */
      const paramsArray = Object.keys(params)
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
            acc.props[`${key.replace(propRegex, '')}`] = params[key]
          }
          if (key.match(traitRegex)) {
            acc.traits[`${key.replace(traitRegex, '')}`] = params[key]
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
