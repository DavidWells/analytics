import { onSubmit, addSubmitListeners } from './onSubmit'
import { onChange, addChangeListeners } from './onChange'
import { listen, listenAll } from './listen'
import submitForm from './onSubmit/submit'
import ignorePatterns from './utils/regex'

export {
  /* single target form submission listener */
  onSubmit,
  /* single target form on change listener */
  onChange,
  /* Single target listen to onSubmit & onChange */
  listen,
  /* attach form submission listener to all forms */
  addSubmitListeners,
  /* attach form change listener to all forms */
  addChangeListeners,
  /* Listen to onSubmit & onChange on all forms */
  listenAll,
  /* Submit form */
  submitForm,
  /* Regex ignore patterns */
  ignorePatterns
}
