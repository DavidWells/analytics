import inBrowser from '../utils/inBrowser'
import { getForm, getForms } from '../utils/getForms'
import toArray from '../utils/toArray'
import getCallback from '../utils/getCallback'
import filterValues from '../utils/filter'
import getFormData from '../utils/getFormValues'

/**
 * Attach submission listener to single form
 * @param  {string|DOMNode} formElement - Form selector or form element
 * @param  {object} opts        [description]
 * @return {null}
 */
export function onChange(formElement, options, callback) {
  if (!inBrowser) return false
  const form = getForm(formElement)
  const cb = getCallback(options, callback) || options.onChange
  if (!cb) throw new Error('No callback supplied')
  const opts = Object.assign({}, options, {
    onChange: cb
  })
  const changeHandler = processChanges(opts, form)
  const inputs = toArray(form.elements)
  inputs.forEach((input) => {
    input.addEventListener('change', changeHandler, false)
  })

  // Detach event listeners
  return () => {
    inputs.forEach((input) => {
      input.removeEventListener('change', changeHandler, false)
    })
  }
}

/**
 * Attach submission listeners to forms
 * @param  {Object} [opts={}] [description]
 * @return {[type]}           [description]
 */
export function addChangeListeners(opts = {}) {
  if (!inBrowser) return false
  const formsToProcess = getForms(opts)
  const listeners = formsToProcess.map((f) => {
    return onChange(f, opts)
  })
  return () => {
    listeners.forEach((unsub) => unsub())
  }
}

function processChanges(opts, form) {
  const { onChange } = opts
  return (event) => {
    const input = event.target
    const allValues = getFormData(form)

    const name = input.name || input.id
    const values = filterValues({
      [`${name}`]: allValues[name]
    }, opts)

    if (Object.keys(values).length && onChange && typeof onChange === 'function') {
      onChange(event, {
        [`${name}`]: allValues[name]
      })
    }
  }
}
