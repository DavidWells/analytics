<!--
title: Storage Utils
pageTitle: Storage Utils
description: Utility library for persisting data
-->

# Analytics Storage Utils

A tiny storage utility library with fallback mechanism in <!-- AUTO-GENERATED-CONTENT:START (pkgSize) -->`999 bytes`<!-- AUTO-GENERATED-CONTENT:END -->.

By default, `@analytics/storage-utils` will persist values in browser in this order:

1. Try `localStorage`
2. If no `localStorage`, use `cookies`
3. If no `cookies`, use `sessionStorage`
4. If no `sessionStorage`, use `global` window

If you want to specify which storage mechanism to use, use the `options` parameter.

[See live demo](https://utils-storage.netlify.app).

## `setItem`

Set a value.

```js
import { setItem } from '@analytics/storage-utils'

/** 
* Basic usage 
*/

/* Save value to `localStorage` or `cookies` or `global` */
setItem('key', 'value')
// { value: "value", oldValue: "old", location: "localStorage" }

/** Setting values to specific location */

/* Set value to specifically localStorage */
setItem('key', 'otherValue', { storage: 'localStorage' })
// { value: "otherValue", oldValue: "value", location: "localStorage" }

/* Set value to specifically cookie */
setItem('keyTwo', 'cookieVal',  { storage: 'cookie' })
// { value: "cookieVal", oldValue: "null", location: "cookie" }

/* Set value from specifically sessionStorage */
setItem('keyThree', 'xyz', { storage: 'sessionStorage' })
// { value: "cookieVal", oldValue: "null", location: "sessionStorage" }

/* Set value from specifically the global window (or global this in node.js) */
setItem('keyThree', 'xyz', { storage: 'global' })
// { value: "cookieVal", oldValue: "null", location: "cookie" }
```


## `getItem`

Get a value.

```js
import { getItem } from '@analytics/storage-utils'

/* Basic usage */

/* Lookup value from `localStorage` or `cookies` or `global` */
const value = getItem('key')

/** 
 * Getting values to specific locations
 */

// Get value to specifically localStorage
const getLocalStorageValue = getItem('key', { storage: 'localStorage' })

/* Get value to specifically cookie */
const getCookieValue = getItem('key', { storage: 'cookie' })

// Get value to specifically sessionStorage
const getSessionStorageValue = getItem('key', { storage: 'sessionStorage' })

/* Get value from specifically the global window (or global this in node.js) */
const getGlobalValue = getItem('key', { storage: 'global' })

/* Get value from all locations */
const valueObj = getItem('otherKey', { storage: '*' })
// { cookie: undefined, localStorage: "hahaha", global: null }
```

## `removeItem`

Remote a value.

```js
import { removeItem } from '@analytics/storage-utils'

/* Basic usage */

// Will try remove value from `localStorage` -> `cookies` -> `global`
removeItem('key')

/** Removing values to specific locations */

/* Remove value to specifically localStorage */
removeItem('key', { storage: 'localStorage' })

/* Remove value to specifically cookie */
removeItem('keyTwo', { storage: 'cookie' })

/* Remove value to specifically sessionStorage */
removeItem('key', { storage: 'sessionStorage' })

/* Remove value to specifically global */
removeItem('keyThree', { storage: 'global' })

/* Remove value from all locations */
removeItem('otherKey', { storage: '*' })
```
