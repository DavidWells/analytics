import dotProp from 'dlv'
import storage, { getCookie, setCookie, removeCookie, globalContext } from '@analytics/storage-utils'
import { decodeUri } from './decodeUri'
import { getBrowserLocale } from './getBrowserLocale'
import { getTimeZone } from './getTimeZone'
import { inBrowser } from './inBrowser'
import { isExternalReferrer } from './isExternalReferrer'
import { isScriptLoaded } from './isScriptLoaded'
import { noOp } from './noOp'
import { paramsClean } from './paramsClean'
import { paramsGet } from './paramsGet'
import { paramsParse } from './paramsParse'
import { paramsRemove } from './paramsRemove'
import { parseReferrer  } from './parseReferrer'
import { uuid  } from './uuid'
import { throttle } from './throttle'
import url from './url'
import {
  isFunction,
  isString,
  isObject,
  isUndefined,
  isBoolean,
  isArray
} from './typeCheck'

export {
  storage,
  getCookie,
  setCookie,
  globalContext,
  removeCookie,
  isFunction,
  isString,
  isArray,
  isObject,
  isUndefined,
  isBoolean,
  dotProp,
  decodeUri,
  getBrowserLocale,
  getTimeZone,
  inBrowser,
  isExternalReferrer,
  isScriptLoaded,
  noOp,
  paramsClean,
  paramsGet,
  paramsParse,
  paramsRemove,
  parseReferrer,
  url,
  uuid,
  throttle,
}
