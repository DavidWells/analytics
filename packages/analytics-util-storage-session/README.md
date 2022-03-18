<!--
title: Javascript SessionStorage Utilities
pageTitle: SessionStorage Utils
description: Utility library for managing HTML SessionStorage
-->

# SessionStorage Utilities

A tiny sessionStorage utility library with fallbacks in <!-- AUTO-GENERATED-CONTENT:START (pkgSize) -->`239 bytes`<!-- AUTO-GENERATED-CONTENT:END -->.

This module will automatically fail back to global window storage if `sessionStorage` is not available.

Exposes `hasSessionStorage`, `getItem`, `setItem`, & `removeItem` functions.

[See live demo](https://utils-session-storage.netlify.app/).

## How to install

Install `@analytics/session-storage-utils` from [npm](https://www.npmjs.com/package/@analytics/session-storage-utils).

```bash
npm install @analytics/session-storage-utils
```

## API

Below is the api for `@analytics/session-storage-utils`. These utilities are tree-shakable.

## `hasSessionStorage`

Check if sessionStorage is supported

```js
import { hasSessionStorage } from '@analytics/session-storage-utils'

if (hasSessionStorage()) {
  // Use session storage 
}
```

## `getSessionItem`

Get a sessionStorage value.

```js
import { getSessionItem } from '@analytics/session-storage-utils'

const value = getItem('item-key')
```

## `setSessionItem`

Set a sessionStorage value.

```js
import { setSessionItem } from '@analytics/session-storage-utils'

setSessionItem('item-key', 'a')
```

## `removeSessionItem`

Delete a sessionStorage value.

```js
import { removeSessionItem } from '@analytics/session-storage-utils'

removeSessionItem('item-key')
```
