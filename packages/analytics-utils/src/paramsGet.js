import {decodeUri} from './decodeUri'

/**
 * Get a given query parameter value
 * @param  {string} param - Key of parameter to find
 * @param  {string} url - url to search
 * @return {string} match
 */
export function paramsGet(param, url) {
  return decodeUri((RegExp(`${param}=(.+?)(&|$)`).exec(url) || [, ''])[1])
}
