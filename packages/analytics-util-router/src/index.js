
/* Listener for pushstate route changes */
export default function onRouteChange(fn) {
  if (typeof window === 'undefined') return
  const { addEventListener, history, location } = window
  // Set initial pathname
  let previous = location.pathname
  // Observe native navigation
  addEventListener('popstate', () => fn(location.pathname))
  // Observe manual navigation
  ;['push', 'replace'].map((type) => {
    const state = `${type}State`
    const historyFn = history[state]
    history[state] = function() {
      const updated = trimPath(arguments[2])
      if (previous !== updated) {
        previous = updated // Set updated pathname
        setTimeout(() => fn(arguments[2]), 0) // Debounce delay for SPA
      }
      return historyFn.apply(history, arguments)
    }
  })
}

function remove(str, char) {
  const has = str.indexOf(char)
  return (has > -1) ? str.slice(0, has) : str
}

// Trim hash and params off parcial url path
function trimPath(urlPath) {
  ['#', '?'].forEach((x) => urlPath = remove(urlPath, x))
  return urlPath
}