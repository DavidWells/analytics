import inBrowser from './utils/inBrowser'

export default function page (pageData, debug) {
  console.log('Customer.io Page')
  // function to map data to analytics call
  if (!inBrowser) {
    console.log('not in browser', pageData)
    // Do node tracking
    return false
  }

  if (typeof _cio !== 'undefined') {
    if (inBrowser && window.ANALYTICS_DEBUG) {
      console.log(`DEV: Customer.io Pageview > ${window.location.href}`)
    }
    // console.info(`Customer.io Pageview > ${window.location.href}`)
    _cio.page(document.location.href, pageData) // eslint-disable-line
  }
}
