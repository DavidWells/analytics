/*
* @version    1.0.4
* @date       2015-03-13
* @stability  3 - Stable
* @author     Lauri Rooden <lauri@rooden.ee>
* @license    MIT License
* Modified by David Wells
*/

/*
// set
cookie('test', 'a')

// complex set - cookie(name, value, ttl, path, domain, secure)
cookie('test', 'a', 60*60*24, '/api', '*.example.com', true)

// get
cookie('test')

// destroy
cookie('test', '', -1)
*/

function cookie(name, value, ttl, path, domain, secure) {
  if (typeof window === 'undefined') return
  /* Set values */
  if (arguments.length > 1) {
    // eslint-disable-next-line no-return-assign
    return document.cookie = name + '=' + encodeURIComponent(value) +
    // eslint-disable-next-line operator-linebreak
      ((!ttl) ? '' :
        // Has TTL set expiration on cookie
        '; expires=' + new Date(+new Date() + (ttl * 1000)).toUTCString() +
        // If path set path
        ((!path) ? '' : '; path=' + path) +
        // If domain set domain
        ((!domain) ? '' : '; domain=' + domain) +
        // If secure set secure
        ((!secure) ? '' : '; secure'))
  }
  return decodeURIComponent((('; ' + document.cookie).split('; ' + name + '=')[1] || '').split(';')[0])
}

export default cookie
