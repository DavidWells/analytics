import server from './node'
import browser from './browser'

/* This module will shake out unused code + work in browser and node 🎉 */
export default process.browser ? browser : server
