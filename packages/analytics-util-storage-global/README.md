<!--
title: Javascript Global Storage Utilities
pageTitle: GlobalStorage Utils
description: Utility library for managing global values
-->

# Global Storage Utility

A tiny window storage util library in <!-- AUTO-GENERATED-CONTENT:START (pkgSize) -->`406 bytes`<!-- AUTO-GENERATED-CONTENT:END -->.

This will work with [analytics](https://getanalytics.io) or as a standalone import in your code.

[See live demo](https://utils-global-storage.netlify.app/).

## How to install

Install `@analytics/global-storage-utils` from [npm](https://www.npmjs.com/package/@analytics/globalstorage-utils).

```bash
npm install @analytics/global-storage-utils
```

## API

Below is the api for `@analytics/global-storage-utils`. These utilities are tree-shakable.

```js
import { get, set, remove } from '@analytics/global-storage-utils'

/* Set value */
set('key', 'value')

/* Get value */
const val = get('key')
console.log(val) // 'value'

/* Remove value */
remove('key')
```
