import inBrowser from '../utils/inBrowser'
import formatArgs from '../utils/args'
import submitHandler from './handler'

/**
 * Attach submission listener to single form
 * @param  {string|DOMNode} formElement - Form selector or form element
 * @param  {object} options -
 * @return {function} detach onSubmit listener
 */
export function onSubmit(formElement, options = {}, callback) {
  if (!inBrowser) return false
  const type = 'submit'
  const [settings, forms] = formatArgs(formElement, options, callback, type)
  const handler = submitHandler(settings)
  // Attach Listeners
  const listeners = forms.map((form) => {
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
