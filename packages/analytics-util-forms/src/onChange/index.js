import { isBrowser, isForm } from '@analytics/type-utils'
import changeHandler from './handler'
import toArray from '../utils/toArray'
import args from '../utils/args'

/**
 * Attach onChange listener to form inputs
 * @param  {string|array} formElement - Selectors or DOM Elements to attach listeners to
 * @param  {Object} [options={}] -
 * @param  {Function} callback - Change handler
 * @return {Function} unsubscribe listeners
 */
export function onChange(formElement, options = {}, callback) {
  if (!isBrowser) return
  const type = 'change'
  const [settings, forms] = args(formElement, options, callback, type)
  // Attach Listeners
  const listeners = forms.map((form) => {
    const handler = changeHandler(settings, form, type)
    const inputs = (isForm(form)) ? toArray(form.elements) : [form]
    // Attach listeners
    inputs.forEach((i) => i.addEventListener(type, handler, false))
    // Unsubscribe event listeners
    return () => {
      inputs.forEach((i) => i.removeEventListener(type, handler, false))
    }
  })
  // Detach event listeners
  return () => listeners.forEach((unsub) => unsub())
}
