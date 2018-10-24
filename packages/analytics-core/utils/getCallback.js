export default function getCallback() {
  for (let i = 0; i < arguments.length; ++i) {
    if (typeof arguments[i] === 'function') {
      return arguments[i]
    }
  }
  return false
}
