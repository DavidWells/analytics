# Analytics Storage Utils

Storage utilities for [analytics](https://www.npmjs.com/package/analytics)

Storage tries to use `localStorage` then `cookies` then defaults to `global` window.

It's also possible to specify exactly where to set, get, and remove data from with the `options` parameter.

## `getItem`

```js
import { getItem } from '@analytics/storage-utils'

// Default lookup, will try resolve value from `localStorage` -> `cookies` -> `global`
const value = getItem('key')

// Get value from specifically localStorage
const getLSValue = getItem('key', 'localStorage')

// Get value from specifically a cookie
const getLSValue = getItem('key', 'cookie')

// Get value from specifically the global window (or global this in Node)
const getLSValue = getItem('key', 'global')

// Get value from all locations
const valueObj = getItem('otherKey', 'all')
// {cookie: undefined, localStorage: "hahaha", global: null}
```

## `setItem`

```js
import { setItem } from '@analytics/storage-utils'

// Will try save value to `localStorage` -> `cookies` -> `global`
setItem('key', 'value')
// -> { value: "value", oldValue: "old", location: "localStorage" }

// Set value to specifically localStorage
setItem('key', 'otherValue', 'localStorage')
// -> { value: "otherValue", oldValue: "value", location: "localStorage" }

// Set value from specifically a cookie
setItem('keyTwo', 'cookieVal', 'cookie')
// -> { value: "cookieVal", oldValue: "null", location: "cookie" }

// Set value from specifically the global window (or global this in Node)
setItem('keyThree', 'xyz', 'global')
// -> { value: "xyz", oldValue: "foobar", location: "global" }
```

## `removeItem`

```js
import { removeItem } from '@analytics/storage-utils'

// Will try save value to `localStorage` -> `cookies` -> `global`
setItem('key')
// -> { location: "localStorage" }

// Set value to specifically localStorage
setItem('key', 'otherValue', 'localStorage')
// -> { location: "localStorage" }

// Set value from specifically a cookie
setItem('keyTwo', 'cookieVal', 'cookie')
// -> { value: "cookieVal", oldValue: "null", location: "cookie" }

// Set value from specifically the global window (or global this in Node)
setItem('keyThree', 'xyz', 'global')
// -> { value: "xyz", oldValue: "foobar", location: "global" }
```
