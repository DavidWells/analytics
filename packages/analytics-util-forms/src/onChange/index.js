import { isBrowser, isForm, CHANGE } from '@analytics/type-utils'
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
  const [settings, forms] = args(formElement, options, callback, CHANGE)

  // Attach Listeners
  const listeners = forms.map((form) => {
    const handler = changeHandler(settings, form, CHANGE)
    const inputs = (isForm(form)) ? toArray(form.elements) : [form]
    // Attach listeners
    inputs.forEach((i) => i.addEventListener(CHANGE, handler, false))
    // Unsubscribe event listeners
    return () => {
      inputs.forEach((i) => i.removeEventListener(CHANGE, handler, false))
    }
  })
  // Detach event listeners
  return () => listeners.forEach((unsub) => unsub())
}
