import toArray from '../utils/toArray'
import { isFunction } from '@analytics/type-utils'

export default function submitForm(form, options = { timeout: 0 }) {
  const { timeout } = options
  setTimeout(() => {
    if (isFunction(form.submit)) {
      form.submit()
      return false
    } else if (isFunction(form.click)) {
      const buttons = form.querySelectorAll('button')
      if (buttons.length) {
        buttons[0].click()
        return false
      }
    }

    toArray(form.elements).forEach((input) => {
      if (input.type === 'submit' && input.name === 'submit') {
        input.click()
      }
    })
  }, timeout)
}
