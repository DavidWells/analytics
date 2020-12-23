/**
 * Expose Tab visbility events to analtyics
 * Trigger analytics actions when tab is hidden or visible
 * @param  {Object} [pluginConfig={}] - config
 * @return {Object} Analytics plugin
 */
export default function tabEventsPlugin(pluginConfig = {}) {
  const events = {
    /**
     * `tabHidden` - Fires when visitor goes to another browser tab.
     */
    tabHidden: 'tabHidden',
    /**
     * `tabVisible` - Fires when visitor comes back to window from another browser tab.
     */
    tabVisible: 'tabVisible'
  }
  return {
    name: 'tab-events',
    EVENTS: events,
    config: pluginConfig,
    bootstrap: ({ instance }) => {
      /* Dispatch event when tab visiblity changes */
      onTabChange(isHidden => {
        instance.dispatch({
          type: (isHidden) ? events.tabHidden : events.tabVisible,
        })
      })
    }
  }
}

/**
 * Fire a callback on tab visibility changes
 * @param  {function} callback - function to run on visibility change
 * @return {function} detach onTabChange listener
 */
export function onTabChange(callback) {
  if (typeof window === 'undefined') return false
  const prop = getHiddenProp()
  if (!prop) return false
  const event = `${prop.replace(/[H|h]idden/, '')}visibilitychange`
  const handler = () => {
    /* eslint-disable standard/no-callback-literal */
    if (document[prop]) return callback(true)
    return callback(false)
    /* eslint-enable */
  }
  document.addEventListener(event, handler)
  return () => document.removeEventListener(event, handler)
}

function getHiddenProp() {
  const prefixes = ['webkit', 'moz', 'ms', 'o']
  // if 'hidden' is natively supported just return it
  if ('hidden' in document) return 'hidden'
  // otherwise loop over all the known prefixes until we find one
  return prefixes.reduce((acc, curr) => {
    if (!acc && `${curr}Hidden` in document) {
      return `${curr}Hidden`
    }
    return acc
  }, null)
}
