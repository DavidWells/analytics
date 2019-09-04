import filterValues from '../utils/filter'
import { getValue } from '../utils/getFormValues'

export default function processChanges(opts, element) {
  const { onChange } = opts
  return (event) => {
    const input = event.target
    const name = input.name || input.id
    const val = getValue(element, name)

    const values = filterValues(val, opts)

    if (Object.keys(values).length && onChange && typeof onChange === 'function') {
      onChange(event, val)
    }
  }
}
