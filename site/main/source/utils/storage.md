---
title: Storage Utils
pageTitle: Storage Utils
description: Utility library for persisting data
---

Stand alone storage utilities used in [analytics](https://www.npmjs.com/package/analytics)

By default, `@analytics/storage-utils` will persist values in browser in this order:

1. `localStorage`
2. If no `localStorage`, use `cookies`
3. If no `cookies`, use `global` window

If you want to specify which storage mechanism to use, use the `options` parameter.

## `setItem`

Set a value.

```js
import { setItem } from '@analytics/storage-utils'

/** 
* Basic usage 
*/

/* Save value to `localStorage` or `cookies` or `global` */
setItem('key', 'value')
// returns { value: "value", oldValue: "old", location: "localStorage" }

/** Setting values to specific location */

/* Set value to specifically localStorage */
setItem('key', 'otherValue', 'localStorage')
// setItem('key', 'otherValue', { storage: 'localStorage' })
// returns { value: "otherValue", oldValue: "value", location: "localStorage" }

/* Set value to specifically cookie */
setItem('keyTwo', 'cookieVal', 'cookie')
// setItem('keyTwo', 'cookieVal', { storage: 'cookie' })
// returns { value: "cookieVal", oldValue: "null", location: "cookie" }

/* Set value from specifically the global window (or global this in node.js) */
setItem('keyThree', 'xyz', 'global')
// setItem('keyThree', 'xyz', { storage: 'global' })
// returns { value: "cookieVal", oldValue: "null", location: "cookie" }
```

## `getItem`

Get a value.

```js
import { getItem } from '@analytics/storage-utils'

/* Basic usage */

/* Lookup value from `localStorage` or `cookies` or `global` */
const value = getItem('key')

/** 
 * Getting values to specific location 
 */

// Get value to specifically localStorage
const getLSValue = getItem('key', 'localStorage')

/* Get value to specifically cookie */
const getLSValue = getItem('key', 'cookie')
// getItem('key', { storage: 'cookie' })

/* Get value from specifically the global window (or global this in node.js) */
const getLSValue = getItem('key', 'global')
// getItem('key', { storage: 'global' })

/* Get value from all locations */
const valueObj = getItem('otherKey', '*')
// returns { cookie: undefined, localStorage: "hahaha", global: null }
```

## `removeItem`

Remote a value.

```js
import { removeItem } from '@analytics/storage-utils'

/* Basic usage */

// Will try remove value from `localStorage` -> `cookies` -> `global`
removeItem('key')

/** Removing values to specific location */

/* Remove value to specifically localStorage */
removeItem('key', 'localStorage')
// removeItem('key', { storage: 'localStorage' })

/* Remove value to specifically cookie */
removeItem('keyTwo', 'cookie')
// removeItem('keyTwo', { storage: 'cookie' })

/* Remove value to specifically global */
removeItem('keyThree', 'global')
// removeItem('keyThree', { storage: 'global' })
```
