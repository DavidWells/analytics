import throttle from './throttle'
import { inBrowser } from 'analytics-utils'

export function mouseOut(cb) {
  if (!inBrowser) return false
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
