import nodeCode from './node'
import browser from './browser'

/* This module will shake out unused code and work in browser and node 🎉 */
export default process.browser ? browser : nodeCode
