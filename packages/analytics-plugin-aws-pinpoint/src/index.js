import serverSide from './node'
import clientSide from './browser'
import * as PINPOINT_EVENTS from './pinpoint/events'

/* This module will shake out unused code + work in browser and node 🎉 */
export default process.browser ? clientSide : serverSide

export { PINPOINT_EVENTS }