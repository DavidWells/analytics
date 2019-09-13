import { onSubmit } from './onSubmit'
import { onChange } from './onChange'
import { listen } from './listen'
import { getFormData, getInputData } from './utils/getFormValues'
import submitForm from './onSubmit/submit'
import filterData from './utils/filter'
import ignorePatterns from './utils/regex'

export {
  /* Listen to onSubmit events on 1 or more forms */
  onSubmit,
  /* Listen to onChange events on 1 or more forms */
  onChange,
  /* Listen to onChange & onSubmit events on 1 or more forms */
  listen,
  /* Submit form via Javascript */
  submitForm,
  /* Get values from form inputs */
  getFormData,
  /* Get value from single form input */
  getInputData,
  /* Filter out & omit sensitive fields */
  filterData,
  /* Regex ignore patterns */
  ignorePatterns,
}
