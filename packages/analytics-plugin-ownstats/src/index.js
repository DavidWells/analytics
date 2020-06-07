import ownstatsNode from './node'
import ownstatsBrowser from './browser'

/* This module will shake out unused code + work in browser and node 🎉 */
export default process.browser ? ownstatsBrowser : ownstatsNode
