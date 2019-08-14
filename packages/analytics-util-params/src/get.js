import decodeUri from './utils/decodeUri'

/**
 * Get a given query parameter value
 * @param  {string} param - Key of parameter to find
 * @param  {string} url - url to search
 * @return {string} match
 */
export default function getValueParamValue(param, url) {
  /* eslint-disable no-sparse-arrays */
  return decodeUri((RegExp(`${param}=(.+?)(&|$)`).exec(url) || [, ''])[1])
}
