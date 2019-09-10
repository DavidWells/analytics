
/*
* @version    1.0.4
* @date       2015-03-13
* @stability  3 - Stable
* @author     Lauri Rooden <lauri@rooden.ee>
* @license    MIT License
*/

/*
// simple set
cookie('test', 'a')

// complex set - cookie(name, value, ttl, path, domain, secure)
cookie('test', 'a', 60*60*24, '/api', '*.example.com', true)

// get
cookie('test')

// destroy
cookie('test', '', -1)
*/

function cookie(name, value, ttl, path, domain, secure) {
  if (arguments.length > 1) {
    /* eslint-disable no-return-assign */
    return document.cookie = `${name}=${encodeURIComponent(value)}${(!ttl) ? '' : `; expires=${new Date(+new Date() + (ttl * 1000)).toUTCString()}`}${(!path) ? '' : `; path=${path}`}${(!domain) ? '' : `; domain=${domain}`}${(!secure) ? '' : '; secure'}`
    /* eslint-enable */
  }
  return decodeURIComponent(((`; ${document.cookie}`).split(`; ${name}=`)[1] || '').split(';')[0])
}

const noOp = () => {}

/* This module will shake out unused code and work in browser and node 🎉 */
export default process.browser ? cookie : noOp
