import { paramsParse, paramsRemove, storage, uuid } from 'analytics-utils'
import EVENTS from '../events'
import { ANON_ID } from '../constants'
import { identify } from '../modules/user'
import { trackEvent } from '../modules/track'

// Middleware runs during EVENTS.INITIALIZE
export default function initializeMiddleware(instance) {
  return store => next => action => {
    if (action.type === EVENTS.INITIALIZE) {
      // 1. Set anonymous ID
      if (!storage.getItem(ANON_ID)) {
        instance.storage.setItem(ANON_ID, uuid())
      }

      // 2. Parse params
      const params = paramsParse()
      const paramsArray = Object.keys(params)
      if (paramsArray.length) {
        const groupedParams = paramsArray.reduce((acc, key) => {
          // match utm params & dclid (display) & gclid (cpc)
          if (key.match(/^utm_/) || key.match(/^(d|g)clid/)) {
            acc.campaign[key] = params[key]
          }
          if (key.match(/^an_prop_/)) {
            acc.props[`${key.replace(/^an_prop_/, '')}`] = params[key]
          }
          if (key.match(/^an_trait_/)) {
            acc.traits[`${key.replace(/^an_trait_/, '')}`] = params[key]
          }
          return acc
        }, {
          campaign: {},
          props: {},
          traits: {}
        })

        store.dispatch({
          type: EVENTS.PARAMS,
          raw: params,
          ...groupedParams
        })

        if (params.an_uid) {
          // timeout to debounce and make sure integration is registered. Todo refactor
          setTimeout(() => {
            store.dispatch(identify(params.an_uid, groupedParams.traits))
          }, 0)
        }

        if (params.an_event) {
          // timeout to debounce and make sure integration is registered. Todo refactor
          setTimeout(() => {
            store.dispatch(
              trackEvent(params.an_event, groupedParams.props)
            )
          }, 0)
        }

        // if url has utm params
        if (Object.keys(groupedParams.campaign).length) {
          store.dispatch({
            type: EVENTS.CAMPAIGN,
            campaign: groupedParams.campaign
          })
        }

        if (params.an_clean) {
          // timeout to debounce and make sure integration is registered. Todo refactor
          setTimeout(() => {
            paramsRemove('an_')
          }, 0)
        }
      }

      /* TODO set these?
      var setFirstVisitDate = function(storage) {
          var now = new Date();
          var year = now.getFullYear().toString();
          var day = now.getDate().toString();
          var month = now.getMonth() + 1;
          if (month < 10) {
              month = '0' + month.toString();
          }
          var dateString = year + month + day;

          storage.set('firstVisitDate', dateString);
          return dateString;
      }
      var setDaysSinceFirstVisit = function(storage, firstDate) {
          var firstDateISO = firstDate.substring(0, 4) + '-' + firstDate.substring(4, 6) + '-' + firstDate.substring(6);
          var firstDateTime = new Date(firstDateISO)
          var now = new Date();

          var oneDay = 24 * 60 * 60 * 1000;
          var daysSince = Math.round(Math.abs((firstDateTime.getTime() - now.getTime())/(oneDay)));

          return daysSince.toString();
      }
      */
      // handle user indenfication here

      // handle initial visitor source here
    }
    return next(action)
  }
}
