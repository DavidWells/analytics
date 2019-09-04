import { onSubmit } from './onSubmit'
import { onChange } from './onChange'
import { listen } from './listen'
import submitForm from './onSubmit/submit'
import ignorePatterns from './utils/regex'

export {
  /* Listen to onSubmit events on 1 or more forms */
  onSubmit,
  /* Listen to onChange events on 1 or more forms */
  onChange,
  /* Listen to onChange & onSubmit events on 1 or more forms */
  listen,
  /* Submit form via JS */
  submitForm,
  /* Regex ignore patterns */
  ignorePatterns
}
