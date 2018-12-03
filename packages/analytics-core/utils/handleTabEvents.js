import throttle from './throttle'
import { inBrowser } from 'analytics-utils'

export function mouseOut(cb) {
  let out = false
  document.addEventListener('mouseout', throttle((e) => {
    const evt = e || window.event
    const from = evt.relatedTarget || evt.toElement
    if (!from || from.nodeNode === 'HTML') {
      out = true
      return cb(out)
    }
  }))
  document.addEventListener('mousemove', throttle((e) => {
    if (out) {
      out = false
      return cb(out)
    }
  }))
}

export function tabHidden(cb) {
  if (!inBrowser) {
    return false
  }
  const prop = getHiddenProp()
  if (!prop) {
    return false
  }
  const event = `${prop.replace(/[H|h]idden/, '')}visibilitychange`
  document.addEventListener(event, () => {
    if (document[prop]) return cb(true) // eslint-disable-line
    return cb(false) // eslint-disable-line
  })
}

function getHiddenProp() {
  const prefixes = ['webkit', 'moz', 'ms', 'o']
  // if 'hidden' is natively supported just return it
  if ('hidden' in document) return 'hidden'
  // otherwise loop over all the known prefixes until we find one
  return prefixes.reduce((acc, curr) => {
    if (!acc && `${curr}Hidden` in document) {
      return `${curr}Hidden`
    }
    return acc
  }, null)
}
