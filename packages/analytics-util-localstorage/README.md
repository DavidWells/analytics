<!--
title: Javascript LocalStorage Utilities
pageTitle: LocalStorage Utils
description: Utility library for managing HTML LocalStorage
-->

# LocalStorage Utilities

[Tiny](https://bundlephobia.com/result?p=@analytics/localstorage-utils) LocalStorage utilities library for [analytics](https://npmjs.com/package/analytics) & whatever else 🌈

Exposes `hasLocalStorage` function.

This will work with [analytics](https://getanalytics.io) or as a standalone import in your code.

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
