
/* Listener for pushstate route changes */
export default function routeChange(callback) {
  if (typeof document === 'undefined') return
  const { addEventListener, history, location } = window
  // Set initial pathname
  let previousPath = location.pathname
  // Observe native navigation
  addEventListener('popstate', () => {
    callback(location.pathname)
  })
  // Observe manual navigation
  const methods = ['push', 'replace']
  methods.map((type) => {
    const state = `${type}State`
    const historyState = history[state]
    history[state] = function () {
      const updatedPath = trimPath(arguments[2])
      if (previousPath !== updatedPath) {
        // Set updated pathname
        previousPath = updatedPath
        // Debounce delay for SPA
        setTimeout(() => callback(arguments[2]), 0)
      }
      return historyState.apply(history, arguments)
    }
  })
}

// Trim hash and params off parcial url path
function trimPath(urlPath) {
  const hasParam = urlPath.indexOf('?')
  if (hasParam > -1) urlPath = urlPath.slice(0, hasParam)
  const hasHash = urlPath.indexOf('#')
  if (hasHash > -1) urlPath = urlPath.slice(0, hasHash)
  return urlPath
}