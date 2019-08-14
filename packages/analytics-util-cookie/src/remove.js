import setCookie from './set'
import noOp from './noOp'

function removeCookie(name) {
  setCookie(name, '', -1)
}

export default process.browser ? removeCookie : noOp
