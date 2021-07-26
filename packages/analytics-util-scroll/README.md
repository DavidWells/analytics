<!--
title: Scroll Utils
pageTitle: Scroll Utils
description: Utility library for dealing with scroll events
-->
# Scroll Utilities

A tiny utility library for dealing with scroll events in <!-- AUTO-GENERATED-CONTENT:START (pkgSize) -->`2.11kb`<!-- AUTO-GENERATED-CONTENT:END -->.

Exposes `onScrollChange` functions.

This library will work with [analytics](https://getanalytics.io) or as a standalone import in your code.

## How to install

Install `@analytics/scroll-utils` from [npm](https://www.npmjs.com/package/@analytics/scroll-utils).

```bash
npm install @analytics/scroll-utils
```

## API

Below is the api for `@analytics/scroll-utils`. You can import only what you need & the rest will be tree-shaken out of your bundle.

## `onScrollChange`

Listen to form submissions & do stuff with inputs.

This will incept form submissions & fire a custom callback before submitting the form normally

```js
import { onScrollChange } from '@analytics/scroll-utils'

const detachScrollListener = onScrollChange({
  25: (scrollDepth, maxScroll) => {
    console.log('25 % scrolled', scrollDepth)
  },
  50: (scrollDepth, maxScroll) => {
    console.log('50 % scrolled', scrollDepth)
  },
  75: (scrollDepth, maxScroll) => {
    console.log('75 % scrolled', scrollDepth)
  },
  90: (scrollDepth, maxScroll) => {
    console.log('90 % scrolled', scrollDepth)
  },
})

// Detach listener
detachScrollListener()
```
