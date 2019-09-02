import toArray from '../utils/toArray'

export default function submitForm(form, options = { timeout: 0 }) {
  const { timeout } = options
  setTimeout(() => {
    if (typeof form.submit === 'function') {
      form.submit()
      return false
    } else if (typeof form.click === 'function') {
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
