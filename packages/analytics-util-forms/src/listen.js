import { onSubmit } from './onSubmit'
import { onChange } from './onChange'

/**
 * Listen to onChange & onSubmit for forms
 * @param  {string|array} forms - Selectors or DOM Elements to attach listeners to
 * @param  {object} options
 * @param  {function} callback - Submission handler
 * @return {function} detach listeners
 */
export function listen(forms, options, callback) {
  const listeners = [
    onSubmit(forms, options, callback),
    onChange(forms, options, callback)
  ]
  return () => listeners.forEach((unsub) => unsub())
}
