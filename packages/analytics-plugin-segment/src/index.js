import segmentNode from './node'
import segmentBrowser from './browser'

/* This module will shake out unused code + work in browser and node 🎉 */
export default process.browser ? segmentBrowser : segmentNode
