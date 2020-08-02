import snowplowNode from './node'
import snowplowBrowser from './browser'

// /* This module will shake out unused code and work in browser and node 🎉 */
export default process.browser ? snowplowBrowser : snowplowNode