import { isElement } from '@analytics/type-utils'
import toArray from './toArray'

export function getForms(forms, opts) {
  const { excludeForms, includeForms } = opts
  /* eslint-disable no-mixed-operators */
  if (
    excludeForms && !Array.isArray(excludeForms) ||
    includeForms && !Array.isArray(includeForms)) {
    throw new Error('exclude/include forms must be array of elements or selectors')
  }
  /* eslint-enable */
  let excludeNodes = []
  if (excludeForms) {
    excludeNodes = getSelectors(excludeForms, opts.debug)
  }
  const find = (Array.isArray(forms)) ? forms : [forms]
  const formsToProcess = getSelectors(find, opts.debug).filter((f) => {
    if (excludeNodes.includes(f)) return false
    return true
  })
  // console.log('formsToProcess', formsToProcess)
  return formsToProcess
}

function getSelectors(array, debug) {
  return array.reduce((acc, selector) => {
    const elements = getSelector(selector)
    if (!elements.length) {
      if (debug) console.log(`${selector} not found`)
      return acc
    }
    const formNodes = elements.filter((n) => {
      if (!n || (n.nodeName !== 'FORM' && n.nodeName !== 'INPUT')) {
        console.log('Selector passed in not a valid Form')
        return false
      }
      return true
    })
    acc = acc.concat(formNodes)
    return acc
  }, [])
}

function getSelector(selector) {
  if (isElement(selector)) {
    return [selector]
  }
  if (typeof selector !== 'string') {
    throw new Error('Selector must be string')
  }
  return toArray(document.querySelectorAll(selector))
}
