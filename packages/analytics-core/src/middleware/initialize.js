/* eslint-disable camelcase */
import EVENTS from '../events'
import { ANON_ID } from '../constants'

const utmRegex = /^utm_/
const propRegex = /^an_prop_/
const traitRegex = /^an_trait_/

// Middleware runs during EVENTS.initialize
export default function initializeMiddleware(instance) {
  const { setItem, getItem } = instance.storage
  return store => next => action => {
    /* Handle bootstrap event */
    if (action.type === EVENTS.bootstrap) {
      const { params, user } = action
      /* 1. Set anonymous ID. TODO move UUID generation to main function. To fix race conditions */
      if (!getItem(ANON_ID)) {
        setItem(ANON_ID, user.anonymousId)
      }
      /* 2. Parse url params */
      const paramsArray = Object.keys(action.params)
      if (paramsArray.length) {
        const { an_uid, an_event } = params
        const { campaign, props, traits } = paramsArray.reduce((acc, key) => {
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

        /** @type {ParamsPayload} */
        const paramsPayload = {
          type: EVENTS.params,
          raw: params,
          campaign,
          props,
          traits,
          ...(an_uid ? { userId: an_uid } : {}),
        };
        store.dispatch(paramsPayload);

        /* If userId set, call identify */
        if (an_uid) {
          // timeout to debounce and make sure integration is registered. Todo refactor
          setTimeout(() => instance.identify(an_uid, traits), 0)
        }

        /* If tracking event set, call track */
        if (an_event) {
          // timeout to debounce and make sure integration is registered. Todo refactor
          setTimeout(() => instance.track(an_event, props), 0)
        }

        // if url has utm params
        if (Object.keys(groupedParams.campaign).length) {
          /** @type {CampaignPayload} */
          const campaignPayload = {
            type: EVENTS.campaign,
            campaign,
          };
          store.dispatch(campaignPayload);
        }
      }
    }
    return next(action)
  }
}
