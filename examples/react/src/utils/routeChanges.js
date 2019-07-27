
export default function routeChange(callback) {
  const { addEventListener, history, location } = window
  // Observe native navigation
  addEventListener('popstate', () => {
    callback(location.pathname)
  })
  // Observe manual navigation
  const methods = ['push', 'replace']
  methods.map(type => { // eslint-disable-line
    const state = `${type}State`;
    const historyState = history[state];
    history[state] = function() {
      callback(arguments[2])
      return historyState.apply(history, arguments);
    }
  })
}
