import { inBrowser, inReactNative } from 'analytics-utils'

function listen(events, func, toAdd) {
  if (!inBrowser || inReactNative) return false
  let fn = window[(toAdd ? 'add' : 'remove') + 'EventListener']
  events.split(' ').forEach(ev => {
    fn(ev, func)
  })
}

export function check() {
  return Promise.resolve(!navigator.onLine)
}

export function watch(cb) {
  let fn = _ => check().then(cb)
  let listener = listen.bind(null, 'online offline', fn)
  listener(true)
  // return unsubscribe
  return _ => listener(false)
}
