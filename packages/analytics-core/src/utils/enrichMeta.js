import getCallback from './getCallback'
import { stack } from './callback-stack'

// Async promise resolver
function deferredPromiseResolver(resolver, callback) {
  return (data) => {
    if (callback) callback(data)
    resolver(data)
  }
}

export default function generateMeta(meta = {}, resolve, possibleCallbacks) {
    const rid = uuid()
    if (resolve) {
      // stack[`${rid}-info`] = meta
      stack[rid] = deferredPromiseResolver(resolve, getCallback(possibleCallbacks))
    }
    return {
      ...meta,
      rid: rid,
      ts: timestamp(),
      ...(!resolve) ? {} : { hasCallback: true },
    }
  }