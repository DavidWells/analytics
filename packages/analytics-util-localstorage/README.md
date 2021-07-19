<!--
title: Javascript LocalStorage Utilities
pageTitle: LocalStorage Utils
description: Utility library for managing HTML LocalStorage
-->

# LocalStorage Utilities

[Tiny](https://bundlephobia.com/result?p=@analytics/localstorage-utils) LocalStorage utilities library for [analytics](https://npmjs.com/package/analytics) & whatever else 🌈

Exposes `hasLocalStorage`, `getItem`, `setItem`, & `removeItem` functions.

This modules will automatically fail back to global window storage if `localStorage` is not available in the browser.

## How to install

Install `@analytics/localstorage-utils` from [npm](https://www.npmjs.com/package/@analytics/localstorage-utils).

```bash
npm install @analytics/localstorage-utils
```

## API

Below is the api for `@analytics/localstorage-utils`. These utilities are tree-shakable.

## `hasLocalStorage`

Check if localStorage is supported

```js
import { hasLocalStorage } from '@analytics/localstorage-utils'

if (hasLocalStorage()) {
  // Use local storage 
}
```

## `getItem`

Get a localStorage value.

```js
import { getItem } from '@analytics/localstorage-utils'

const value = getItem('cookie-key')
```

## `setItem`

Set a localStorage value.

```js
import { setItem } from '@analytics/localstorage-utils'

setItem('item-key', 'a')
```

## `removeItem`

Delete a localStorage value.

```js
import { removeItem } from '@analytics/localstorage-utils'

removeItem('key')
```
