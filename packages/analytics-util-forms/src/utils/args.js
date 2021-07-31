import { isElement } from '@analytics/type-utils'
import toArray from './toArray'
import isInsideForm from './isInsideForm'
import { getForms } from './getForms'

function isObj(el) {
  return !isElement(el) && typeof el === 'object'
}

export default function formatArgs(elem, opts, cb, type) {
  const eventType = `on${capsFirstChar(type)}`
  const firstArgOpts = isObj(elem)
  const options = (firstArgOpts) ? elem : (isObj(opts)) ? opts : {}
  const callback = options[eventType] || getCallback(opts, cb)
  if (!callback) throw new Error(`No form handler. Add '${eventType}' option or trailing function arg`)
  // Get Form elements
  let find = elem
  /* If ‘all’ attach listeners to all found forms */
  if ((find === 'all' || find === '*') || firstArgOpts) {
    find = options.includeForms || toArray(window.document.forms)
    /* If change listener & option ‘all’ find inputs not in <form> tags */
    if (type === 'change') {
      find = find.concat(toArray(document.querySelectorAll('input')).filter((el) => {
        return !isInsideForm(el)
      }))
    }
  }
  let forms = getForms(find, options)
  // Assign callback options
  const settings = Object.assign({}, options, {
    [`${eventType}`]: callback
  })
  return [ settings, forms ]
}

function capsFirstChar(str) {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`
}

function getCallback() {
  return Array.prototype.slice.call(arguments).reduce((acc, arg) => {
    if (acc) return acc
    if (typeof arg === 'function') {
      return arg
    }
    return acc
  }, false)
}
