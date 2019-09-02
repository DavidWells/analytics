import toArray from './toArray'

export function getForms(opts) {
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
    excludeNodes = getNodes(excludeForms)
  }

  const forms = getNodes(includeForms || toArray(window.document.forms))

  const formsToProcess = forms.filter((f) => {
    if (excludeNodes.includes(f)) return false
    return true
  })

  return formsToProcess
}

export function getForm(formElement) {
  const form = getNode(formElement)
  if (!form) throw new Error('Form not found')
  if (form.nodeName !== 'FORM') throw new Error('Selector passed in not a valid Form')
  return form
}

/**
 * Return list of DOM nodes
 * @param  {[type]} array [description]
 * @return {[type]}       [description]
 */
function getNodes(array) {
  return array.map((selector) => getNode(selector))
}

function getNode(selector) {
  if (isElement(selector)) {
    return selector
  }
  if (typeof selector !== 'string') {
    throw new Error('Selector must be string')
  }
  return document.querySelector(selector)
}

function isElement(element) {
  return element instanceof Element || element instanceof HTMLDocument
}
