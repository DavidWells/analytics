import { CrossStorageClient, CrossStorageHub } from 'cross-storage'
import { isBrowser, isUndefined, isObject } from '@analytics/type-utils'

/**
 * Constructs a new cross storage client
 * @param {string} url    The url to a cross storage hub
 * @param {object} [opts] An optional object containing additional options
 * @param {object} [opts.timeout] timeout
 * @param {object} [opts.frameId] frameId
 * @example
 * const storage = new RemoteStorage('https://example.com/storage.html')
 * @example
 * const storage = new RemoteStorage('https://example.com/storage.html', {
 *   timeout: 5000,
 *   frameId: 'storageFrame'
 * })
 **/
class RemoteStorage {
  constructor(url, opts) {
    if (isBrowser) this.storage = new CrossStorageClient(url, opts)
  }
  getItem(keys) {
    return getRemoteItem(keys, this.storage)
  }
  setItem(key, value, opts = {}) {
    return setRemoteItem(key, value, opts, this.storage)
  }
}

async function getRemoteItem(keys, instance) {
  const remoteKeys = (Array.isArray(keys)) ? keys : [ keys ]

  const promises = remoteKeys.map((name) => {
    return getRemoteItemRaw(name, instance)
  })

  return Promise.all(promises)
    .then((values) => {
      return values.map((val) => safeParse(val))
    })
    .then((data) => {
      // If singular return single value
      if (data.length === 1) {
        return data[0]
      }

      // Else return mapped keys
      return remoteKeys.reduce((acc, curr, i) => {
        acc[curr] = data[i]
        return acc
      }, {})
    })
}

function formatArgs(key, value, opts = {}, instance) {
  const storage = (opts._id) ? opts : instance

  if (isObject(key)) {
    return {
      ...key,
      storage: (isObject(value) && value._id) ? value : storage
    }
  }

  const options = (!opts._id) ? opts : {}
  return {
    key,
    value,
    storage,
    ...options,
  }
}

/**
 * setRemoteItem
 * @param {string} storageKey - localStorage key
 * @param {string} storageValue - localStorage value
 * @param {[function]} resolve - custom resolver function if value already set
 * @param {[functiontype]} instance [description]
 */
async function setRemoteItem(storageKey, storageValue, opts = {}, instance) {
  const { key, value, resolve, storage } = formatArgs(storageKey, storageValue, opts, instance)
  /*
  console.log('key', key)
  console.log('value', value)
  console.log('resolve', resolve)
  console.log('storageInstance', storageInstance)
  /**/

  /* No conflict resolver, set remote item */
  if (!resolve) {
    return setRemoteItemRaw(key, value, storage)
  }

  /* Has conflict resolver, get for remote value */
  const remoteValueRaw = await getRemoteItemRaw(key, storage)
  /* No remote value found, set it */
  if (!remoteValueRaw) {
    return setRemoteItemRaw(key, value, storage)
  }

  /* Remote value found, parse it and run resolver function */
  const remoteParsed = safeParse(remoteValueRaw)
  const localParsed = safeParse(value)

  const newValue = await resolve({
    key: key,
    local: localParsed,
    localRaw: value,
    remote: remoteParsed,
    remoteRaw: remoteValueRaw,
    isEqual: (value === remoteValueRaw) || (localParsed === remoteParsed)
  })
  // console.log('Set new value', newValue)
  return setRemoteItemRaw(key, newValue, storage)
}

/**
 * Get value from remote storage
 * @param  {String} key - localStorage key
 * @return {Promise} - resolved value
 */
function getRemoteItemRaw(key, instance) {
  if (!isBrowser) return
  return instance.onConnect().then(() => instance.get(key))
    // Swallow errors. @TODO make option
    .catch(e => {})
}

/**
 * Set value on remote storage
 * @param  {String} key - localStorage key
 * @param  {String} value - localStorage value
 * @return {Promise}
 */
async function setRemoteItemRaw(key, value, instance) {
  if (isUndefined(value) || !isBrowser) return
  return instance.onConnect().then(() => instance.set(key, value))
    // Swallow errors. @TODO make option
    .catch(e => {})
}

function safeParse(val) {
  if (isUndefined(val)) return
  try {
    return JSON.parse(val)
  } catch (e) {
    return JSON.parse(`"${val}"`)
  }
}

export {
  RemoteStorage,
  // Main methods
  getRemoteItem,
  setRemoteItem,
  // No parsing
  getRemoteItemRaw,
  setRemoteItemRaw,
  // Raw CrossStorage Clients
  CrossStorageClient,
  CrossStorageHub,
}
