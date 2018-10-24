import getOSNameNode from './node'
import getOSNameBrowser from './browser'

export default function getOSName() {
  return (BUILD_WEB) ? getOSNameBrowser() : getOSNameNode()
}
