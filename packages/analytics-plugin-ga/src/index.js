import googleAnalyticsNode from './node'
import googleAnalyticsBrowser from './browser'

/* This module will shake out unused code + work in browser and node 🎉 */
export default process.browser ? googleAnalyticsBrowser : googleAnalyticsNode
