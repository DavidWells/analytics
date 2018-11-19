import { paramsParse, paramsRemove } from 'analytics-utils'
import EVENTS from '../events'
import { identify } from '../modules/user'
import { trackEvent } from '../modules/track'

// Middleware runs during EVENTS.INITIALIZE
const initializeMiddleware = store => next => action => {
  if (action.type === EVENTS.INITIALIZE) {
    // 1. Set anonymous ID

    // 2. Parse params

    const params = paramsParse()
    const paramsArray = Object.keys(params)
    if (paramsArray.length) {
      store.dispatch({
        type: EVENTS.HANDLE_PARAMS,
        params: params
      })

      // parse params
      const groupedParams = paramsArray.reduce((acc, key) => {
        if (key.match(/^utm_/)) {
          acc.utm[key] = params[key]
        }
        if (key.match(/^an_prop_/)) {
          acc.props[`${key.replace(/^an_prop_/, '')}`] = params[key]
        }
        if (key.match(/^an_trait_/)) {
          acc.traits[`${key.replace(/^an_trait_/, '')}`] = params[key]
        }
        return acc
      }, {
        utm: {},
        props: {},
        traits: {}
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
      if (Object.keys(groupedParams.utm).length) {
        store.dispatch({
          type: EVENTS.SET_CAMPAIGN,
          campaign: groupedParams.utm
        })
        // https://www.analyticsmania.com/post/track-the-initial-traffic-source-of-the-visitor-gtm/
        console.log('groupedParams.utmgroupedParams.utm', groupedParams.utm)
        console.log(Object.keys(groupedParams.utm).reduce((acc, curr, i) => {
          return `${acc}${(i) ? '|' : ''}${curr.replace(/^utm_/, '')}=${groupedParams.utm[curr]}`
        }, ''))
        // utmcsr=davidwells.io|utmcmd=referral|utmccn=(not set)
      }

      if (params.an_clean) {
        // timeout to debounce and make sure integration is registered. Todo refactor
        setTimeout(() => {
          paramsRemove('an_')
        }, 0)
      }
    }

    /*
    var setOriginalReferrer = function(storage) {
        var referrerString = null;

        var utmSource = getParameterByName('utm_source', window.location.href);
        if (utmSource) {
            referrerString = utmSource;
        } else {
            var referrer = document.referrer;
            if (!referrer) {
                referrerString = 'direct';
            } else {
                var l = document.createElement('a');
                l.href = referrer;
                referrerString = l.hostname;
            }
        }

        storage.set('originalReferrer', referrerString);
        return referrerString;
    }
    var setOriginalLandingPage = function(storage) {
        var url = APP_CONFIG.S3_BASE_URL;
        storage.set('originalLandingPage', url);
        return url;
    }
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

export default initializeMiddleware
