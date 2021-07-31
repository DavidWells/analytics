import { isBrowser } from '@analytics/type-utils'
import formatArgs from '../utils/args'
import submitHandler from './handler'

/**
 * Attach submission listener to single form
 * @param  {string|DOMNode} formElement - Form selector or form element
 * @param  {object} options -
 * @param  {Function} callback - Submission handler
 * @return {function} detach onSubmit listener
 */
export function onSubmit(formElement, options = {}, callback) {
  if (!isBrowser) return
  const type = 'submit'
  const [settings, forms] = formatArgs(formElement, options, callback, type)
  // Attach Listeners
  const listeners = forms.map((form) => {
    const handler = submitHandler(settings, form, type)
    form.addEventListener(type, handler, false)
    // Detach event listeners
    return () => {
      form.removeEventListener(type, handler, false)
    }
  })
  return () => {
    listeners.forEach((unsub) => unsub())
  }
}
