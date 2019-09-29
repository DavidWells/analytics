import server, {
  initialize as Initialize,
  pageView as PageView,
  trackEvent as TrackEvent,
  identifyVisitor as IdentifyVisitor
} from './node'
import browser, { initialize, pageView, trackEvent, identifyVisitor } from './browser'

/* This module will shake out unused code + work in browser and node 🎉 */
export default process.browser ? browser : server

/* Standalone API */
// Initialize
const init = process.browser ? initialize : Initialize
export { init as initialize }
// PageView
const page = process.browser ? pageView : PageView
export { page }
// TrackEvent
const track = process.browser ? trackEvent : TrackEvent
export { track }
// IdentifyVisitor
const identify = process.browser ? identifyVisitor : IdentifyVisitor
export { identify }
