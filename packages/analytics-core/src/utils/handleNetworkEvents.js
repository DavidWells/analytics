import { isBrowser } from '@analytics/type-utils'

function listen(events, func, toAdd) {
  if (!isBrowser) return
  const fn = window[(toAdd ? 'add' : 'remove') + 'EventListener']
  events.split(' ').forEach(ev => {
    fn(ev, func)
  })
}

export function check() {
  return Promise.resolve(!navigator.onLine)
}

export function watch(cb) {
  const fn = _ => check().then(cb)
  const listener = listen.bind(null, 'online offline', fn)
  listener(true)
  // return unsubscribe function
  return _ => listener(false)
}
