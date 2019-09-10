# Cookie Utilities

[Tiny](https://bundlephobia.com/result?p=@analytics/cookie-utils) cookie utilities library for [analytics](https://npmjs.com/package/analytics) & whatever else 🌈

Exports `getCookie`, `setCookie`, `removeCookie`, & `hasCookieSupport`

<!-- AUTO-GENERATED-CONTENT:START (TOC) -->
- [`getCookie`](#getcookie)
- [`setCookie`](#setcookie)
- [`deleteCookie`](#deletecookie)
- [`hasCookieSupport`](#hascookiesupport)
<!-- AUTO-GENERATED-CONTENT:END -->

## `getCookie`

Get a cookie

```js
import { getCookie } from '@analytics/'

const value = getCookie('cookie-key')
```

## `setCookie`

Set a cookie

```js
import { setCookie } from '@analytics/'

/* simple set */
setCookie('test', 'a')

/* complex set - cookie(name, value, ttl, path, domain, secure) */
setCookie('test', 'a', 60*60*24, '/api', '*.example.com', true)
```

## `deleteCookie`

Delete a cookie

```js
import { deleteCookie } from '@analytics/'

deleteCookie('cookie-key')
```

## `hasCookieSupport`

Check if cookies are supported. Will verify browser will accept cookies

```js
import { hasCookieSupport } from '@analytics/'

if (hasCookieSupport()) {
  // Use them 🍪
}
```
