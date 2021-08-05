<!--
title: Javascript type utils
pageTitle: Type utils
description: Utility library for runtime type checking
-->

# Type Utilities

A tiny tree shakable utility library for runtime type checking.

The entire package weighs in at <!-- AUTO-GENERATED-CONTENT:START (pkgSize) -->`543 bytes`<!-- AUTO-GENERATED-CONTENT:END -->.

[See live demo](https://utils-types.netlify.app/).

### Why this package?

This package exposes re-usable runtime type checking functions. This is useful for shrinking bundle sizes.

## How to install

Install `@analytics/types-utils` from [npm](https://www.npmjs.com/package/@analytics/types-utils).

```bash
npm install @analytics/types-utils
```

## API

Below is the api for `@analytics/types-utils`.

## `isBrowser`

Check if currently in browser context

```js
import { isBrowser } from '@analytics/types-utils'

if (isBrowser) {
  console.log('do things in browser env')
}
```

## `isString`

Check if value is `string`

```js
import { isString } from '@analytics/types-utils'

const xyz = 'hi'
console.log(isString(xyz))
// true
```

## `isNumber`

Check if value is `number`

```js
import { isNumber } from '@analytics/types-utils'

const xyz = 123
console.log(isNumber(xyz))
// true
```

## `isBoolean`

Check if value is `boolean`

```js
import { isBoolean } from '@analytics/types-utils'

const myBool = true
console.log(isBoolean(myBool))
// true
```

## `isArray`

Check if value is `array`

```js
import { isArray } from '@analytics/types-utils'

const myArr = ['x', 'y']
console.log(isArray(myArr))
// true
```

## `isObject`

Check if value is `object`

```js
import { isObject } from '@analytics/types-utils'

const myObj = { cool: 'hello' }
console.log(isObject(myObj))
// true
```

## `isUndefined`

Check if value is `undefined`

```js
import { isUndefined } from '@analytics/types-utils'

let myval
console.log(isUndefined(myval))
// true
```

## `isRegex`

Check if value is regular expression.

```js
import { isRegex } from '@analytics/types-utils'

let myval = /pattern/gm
console.log(isRegex(myval))
// true
```

## `isNoOp`

Check if value is a `noOp` function.

```js
import { isNoOp } from '@analytics/types-utils'

function empty () { }
console.log(isNoOp(isNoOp))
// true
```

## `isElement`

Check if value is a a DOM node.

```js
import { isElement } from '@analytics/types-utils'

const formElement = document.querySelector('.my-form')
console.log(isElement(formElement))
// true
```


## `isNodeList`

Check if value is a list of DOM nodes.

```js
import { isNodeList } from '@analytics/types-utils'

const buttons = document.querySelectorAll('button')
console.log(isNodeList(buttons))
// true
```

## `isForm`

Check if value is a `noOp` function.

```js
import { isForm } from '@analytics/types-utils'

const formElement = document.querySelector('.my-form')
console.log(isForm(formElement))
// true
```