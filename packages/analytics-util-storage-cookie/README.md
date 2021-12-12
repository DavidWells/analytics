<!--
title: Javascript Cookie Utilities
pageTitle: Cookie Utils
description: Utility library for managing HTML cookies
-->

# Cookie Utilities

A tiny cookie utility library with fallbacks in <!-- AUTO-GENERATED-CONTENT:START (pkgSize) -->`460 bytes`<!-- AUTO-GENERATED-CONTENT:END -->.

This module will automatically fail back to global window storage if `cookies` are not available.

Exposes `hasCookies`, `getCookie`, `setCookie`, & `removeCookie` functions.

[See live demo](https://utils-cookies.netlify.app/).

## How to install

Install `@analytics/cookie-utils` from [npm](https://www.npmjs.com/package/@analytics/cookie-utils).

```bash
npm install @analytics/cookie-utils
```

## API

Below is the api for `@analytics/cookie-utils`. These utilities are tree-shakable.

## `hasCookies`

Check if cookies are supported. Will verify browser will accept cookies

```js
import { hasCookies } from '@analytics/cookie-utils'

if (hasCookies()) {
  // Use them 🍪
}
```


## `getCookie`

Get a cookie value.

```js
import { getCookie } from '@analytics/cookie-utils'

const value = getCookie('cookie-key')
```

## `setCookie`

Set a cookie value.

```js
import { setCookie } from '@analytics/cookie-utils'

/* simple set */
setCookie('test', 'a')

/* complex set - cookie(name, value, ttl, path, domain, secure) */
setCookie('test', 'a', 60*60*24, '/api', '*.example.com', true)
```

## `deleteCookie`

Delete a cookie.

```js
import { deleteCookie } from '@analytics/cookie-utils'

deleteCookie('cookie-key')
```