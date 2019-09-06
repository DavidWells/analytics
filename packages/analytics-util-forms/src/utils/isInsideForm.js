
export default function isInsideForm(input) {
  var node = input.parentNode
  while (node != null) {
    if (node.nodeName === 'FORM') {
      return true
    }
    node = node.parentNode
  }
  return false
}
