import customerIoNode from './node'
import customerIoBrowser from './browser'

/* This module will shake out unused code and work in browser and node 🎉 */
export default process.browser ? customerIoBrowser : customerIoNode
