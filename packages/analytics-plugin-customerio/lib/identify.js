import inBrowser from './utils/inBrowser'

export default function identify(id, traits, opts, cb) {
  if (inBrowser && window.ANALYTICS_DEBUG) {
    console.log('do customer.io identify', id, traits)
  }
  if (typeof _cio !== 'undefined') {
    const payload = Object.assign({
      id: id
    }, traits)
    console.log(payload)
    _cio.identify(payload) // eslint-disable-line
  }
}
