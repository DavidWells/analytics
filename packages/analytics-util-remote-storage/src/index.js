import { inBrowser } from 'analytics-utils'
import { CrossStorageClient, CrossStorageHub } from 'cross-storage'

class RemoteStorage {
  constructor(url) {
    if (inBrowser) this.storage = new CrossStorageClient(url)
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

  if (typeof key === 'object') {
    return {
      ...key,
      storage: (typeof value === 'object' && value._id) ? value : storage
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
  if (!inBrowser) return
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
  if (typeof value === 'undefined' || !inBrowser) return
  return instance.onConnect().then(() => instance.set(key, value))
    // Swallow errors. @TODO make option
    .catch(e => {})
}

function safeParse(val) {
  if (typeof val === 'undefined') return
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
