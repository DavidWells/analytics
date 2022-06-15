import serverside, * as server from './node'
import client, * as browser from './browser'

/* This module will shake out unused code + work in browser and node 🎉 */
export default process.browser ? client : serverside

/* init for CDN usage. globalName.init() */
const init = process.browser ? client : serverside
export { init }

/* Standalone API */
const initialize = process.browser ? browser.initialize : server.initialize
const page = process.browser ? browser.pageView : server.pageView
const track = process.browser ? browser.trackEvent : server.trackEvent
const identify = process.browser ? browser.identifyVisitor : server.identifyVisitor

export {
  identify,
  track,
  page,
  initialize
}
