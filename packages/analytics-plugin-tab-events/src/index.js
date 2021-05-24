const isServer = typeof window === 'undefined'
const HIDDEN = 'hidden'

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
  if (isServer) return false
  const prop = getHiddenProp()
  const event = `${prop.replace(/[H|h]idden/, '')}visibilitychange`
  const handler = () => callback(Boolean(document[prop]))
  const attachFunc = () => document.addEventListener(event, handler)
  attachFunc()
  return () => {
    document.removeEventListener(event, handler)
    return attachFunc
  }
}

/**
 * Check if tab is hidden
 * @return {boolean} true if tab hidden
 */
export function isTabHidden() {
  if (isServer) return false
  return Boolean(document[getHiddenProp()])
}

function getHiddenProp() {
  const prefixes = ['webkit', 'moz', 'ms', 'o']
  // if 'hidden' is natively supported just return it
  if (isServer || HIDDEN in document) return HIDDEN
  // otherwise loop over all the known prefixes until we find one
  return prefixes.reduce((acc, curr) => {
    const prop = curr + 'Hidden'
    if (!acc && prop in document) return prop
    return acc
  }, null)
}
