import inBrowser from './utils/inBrowser'

export default function track (eventName, payload, options, callback) {
  if (inBrowser && window.ANALYTICS_DEBUG) {
    const msg = `Customer.io Event > [${eventName}] [payload: ${JSON.stringify(payload, null, 2)}]`
    console.log(msg)
    return false
  }

  if (typeof _cio !== 'undefined') {
    console.log('Customer.io Event triggered')
    _cio.track(eventName, payload)
  }

  const cb = getCallback(Array.prototype.slice.call(arguments))
  if (cb) {
    return cb()
  }

  return Promise.resolve()
}

function getCallback(args) {
  for (let i = 0; i < args.length; ++i) {
    if (typeof args[i] === 'function') {
      return args[i]
    }
  }
  return false
}
