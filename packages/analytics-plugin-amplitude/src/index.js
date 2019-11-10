import amplitudeNode from './node'
import amplitudeBrowser from './browser'

export default process.browser ? amplitudeBrowser : amplitudeNode
