---
title: Javascript Global Storage Utilities
pageTitle: Global Storage Utils
description: Utility library for managing global values
---

[Tiny](https://bundlephobia.com/result?p=@analytics/Global Storage-utils) Global Storage utilities library for [analytics](https://npmjs.com/package/analytics) & whatever else 🌈

This will work with [analytics](https://getanalytics.io) or as a standalone import in your code.

[Live demo](https://utils-global-storage.netlify.app/)

## How to install

Install `@analytics/globalstorage-utils` from [npm](https://www.npmjs.com/package/@analytics/globalstorage-utils).

```bash
npm install @analytics/Global Storage-utils
```

## API

Below is the api for `@analytics/globalstorage-utils`. These utilities are tree-shakable.

```js
import { get, set, remove } from '@analytics/globalstorage-utils'

set('key', 'value')

const val = get('key')
console.log(val) // 'value'

remove('key')
```
