---
title: Javascript event listener util
pageTitle: Event Listener Utils
description: Utility library for adding backwards compatible event listeners
---

A [tiny](https://bundlephobia.com/result?p=@analytics/listener-utils) utilities library for dealing with event listeners.

Exposes `addListener`, `removeListener` functions.

This library will work with [analytics](https://getanalytics.io) or as a standalone package.

[See live demo](https://event-listener-util.netlify.app/).

### Why this package?

This package makes it a little easy to work with `addEventListener` & `removeEventListener` by returning a clean up function for both. This makes it easy to re-attach a listener or disable a listener with it's return function.

Additionally this package is backwards compatible with older browsers. This library is backwards compatible back to IE 8.

## How to install

Install `@analytics/listener-utils` from [npm](https://www.npmjs.com/package/@analytics/listener-utils).

```bash
npm install @analytics/listener-utils
```

## API

Below is the api for `@analytics/listener-utils`.

## `addListener`

Add an event listener to an element.

```js
import { addListener } from '@analytics/listener-utils'

const button = document.querySelector('#my-button')
const options = {} // (optional) See opts at https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener

// addListener returns a disable listener function
const disableListener = addListener(button, 'click', () => {
  console.log('wow you clicked it!')
}, options)

// Detach the listener
disableListener()
```

Below is an example of automatically disabling a click handler while an api request is in flight

```js
import { addListener } from '@analytics/listener-utils'

const apiButton = document.querySelector('#api')
const disableFetchListener = addListener(apiButton, 'click', () => {
  // Fetch in progress disable click handler to avoid duplicate calls
  const renableAPIClickHandler = disableFetchListener()

  fetch(`https://swapi.dev/api/people/?search=l`)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      console.log("data", json.results)
      // Success! Reattach event handler
      renableAPIClickHandler()
    })
    .catch((err) => {
      console.log('API error', err)
        // Error! Reattach event handler
      renableAPIClickHandler()
    })
});

// call disableFetchListener wherever you wish to disable this click handler
```

See [addEventListener docs](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) for options 

## `removeListener`

Removes an event listener from an element.

```js
import { addListener, removeListener } from '@analytics/listener-utils'

const button = document.querySelector('#my-button')
const simpleFunction = () => console.log('wow you clicked it!')
addListener(button, 'click', simpleFunction)

const options = {} // (optional) See opts at https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener

// removeListener returns an enable listener function
const reAttachListener = removeListener(button, 'click', simpleFunction, options)

// Reattach the listener
reAttachListener()
```

See [removeEventListener docs](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) for options 
