---
title: Javascript event listener util
pageTitle: Event Listener Utils
description: Utility library for adding backwards compatible event listeners
---

A tiny utility library for working with event listeners in <!-- AUTO-GENERATED-CONTENT:START (pkgSize) -->`563 bytes`<!-- AUTO-GENERATED-CONTENT:END -->.

Exposes `addListener`, `removeListener` functions.

This library will work with [analytics](https://getanalytics.io) or as a standalone package.

[See live demo](https://utils-event-listener.netlify.app/).

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

addListener('#button', 'click', () => {
  console.log('do stuff')
})
```

This method returns a cleanup function. When the cleanup function is called the event listener is removed.

```js
import { addListener } from '@analytics/listener-utils'

const selectorOrNode = '#my-button'
const event = 'click'
const opts = {} // (optional) See opts at https://mzl.la/2QtNRHR
const handler = () => {
  console.log('wow you clicked it!')
}
// addListener returns a disable listener function
const disableListener = addListener(selectorOrNode, event, handler, opts)

// Detach the listener
const reAttachListner = disableListener()

// reAttach the listener
const disableAgain = reAttachListner()
// ...and so on
```

Below is an example of automatically disabling a click handler while an api request is in flight

```js
import { addListener } from '@analytics/listener-utils'

const disableFetchListener = addListener('#api', 'click', () => {
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
})
// call disableFetchListener wherever you wish to disable this click handler
```

See [addEventListener docs](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) for options 

Fire an event once

```js
import { addListener } from '@analytics/listener-utils'

addListener('#my-button', 'click', () => {
  console.log('will fire only once')
}, { once: true })
```

Fire an event on multiple event types

```js
import { addListener } from '@analytics/listener-utils'

addListener('#my-button', 'click mouseover', () => {
  console.log('will fire on click & mouseover events')
})
```

## `removeListener`

Removes an event listener from an element.

```js
import { addListener, removeListener } from '@analytics/listener-utils'

const buttonSelector = '#my-button'
const simpleFunction = () => console.log('wow you clicked it!')
addListener(buttonSelector, 'click', simpleFunction)

const options = {} 
// (optional) See opts at https://mzl.la/2QtNRHR

// removeListener returns an enable listener function
const altSeletor = document.querySelector('#my-button')
const reAttachListener = removeListener(altSeletor, 'click', simpleFunction, options)

// Reattach the listener
reAttachListener()
```

See [removeEventListener docs](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) for options 

## `once`

Utility function to fire function exactly once.

```js
import { once } from '@analytics/listener-utils'

function simpleFunction() {
  console.log('Fired')
}

const onceOnlyFunc = once(simpleFunction)

onceOnlyFunc()
// Fired
onceOnlyFunc()
// nothing fired
```
