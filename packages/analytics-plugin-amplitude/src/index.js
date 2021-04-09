import serverSide from './node'
import clientSide from './browser'

/* This module will shake out unused code + work in browser and node 🎉 */
export default process.browser ? clientSide : serverSide