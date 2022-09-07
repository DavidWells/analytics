import serverside from './node'
import client from './browser'

/* This module will shake out unused code + work in browser and node 🎉 */
export default process.browser ? client : serverside

/* init for CDN usage. globalName.init() */
const init = process.browser ? client : serverside
export { init }
