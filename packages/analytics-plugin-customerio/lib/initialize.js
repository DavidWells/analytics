import inBrowser from './utils/inBrowser'
/**
 * initialize customer.io in browser
 * @param  {string} siteID customer io site id
 */
export default function initialize(siteID) {
  if (inBrowser && typeof _cio === 'undefined') {
    window._cio = [];
    (function() {
      var a, b, c
      a = function(f) {
        return function() {
          _cio.push([f].concat(Array.prototype.slice.call(arguments, 0)))
        }
      }
      b = ['load', 'identify', 'sidentify', 'track', 'page']
      for (c = 0; c < b.length; c++) { _cio[b[c]] = a(b[c]) }
      var t = document.createElement('script')
      var s = document.getElementsByTagName('script')[0]
      t.async = true
      t.id = 'cio-tracker'
      t.setAttribute('data-site-id', siteID)
      t.src = 'https://assets.customer.io/assets/track.js'
      s.parentNode.insertBefore(t, s)
    })()
  }
}
