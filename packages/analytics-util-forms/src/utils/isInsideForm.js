import { isForm } from '@analytics/type-utils'

export default function isInsideForm(input) {
  var node = input.parentNode
  while (node != null) {
    if (isForm(node)) {
      return true
    }
    node = node.parentNode
  }
  return false
}
