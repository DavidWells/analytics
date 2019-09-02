import interceptForm from './intercept'
import inBrowser from '../utils/inBrowser'
import getCallback from '../utils/getCallback'
import { getForm, getForms } from '../utils/getForms'

/**
 * Attach submission listener to single form
 * @param  {string|DOMNode} formElement - Form selector or form element
 * @param  {object} options -
 * @return {function} detach onSubmit listener
 */
export function onSubmit(formElement, options = {}, callback) {
  if (!inBrowser) return false
  const form = getForm(formElement)
  const cb = getCallback(options, callback) || options.onSubmit
  if (!cb) throw new Error('No callback supplied')
  const opts = Object.assign({}, options, {
    onSubmit: cb
  })
  const processingFunc = interceptForm(opts)
  form.addEventListener('submit', processingFunc, false)
  // Detach event listeners
  return () => {
    form.removeEventListener('submit', processingFunc, false)
  }
}

/**
 * Attach submission listeners to forms
 * @param  {Object} [options={}] [description]
 * @return {Function} detach onSubmit listeners
 */
export function addSubmitListeners(options = {}) {
  if (!inBrowser) return false
  const formsToProcess = getForms(options)
  const listeners = formsToProcess.map((form) => {
    return onSubmit(form, options)
  })
  return () => {
    listeners.forEach((unsub) => unsub())
  }
}
