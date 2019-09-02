---
title: Listen & React to analytic events in your application with custom listeners
pageTitle: Using Listeners
description: Listen & reacting to analytic lifecycle events
---

The `analytics` library comes with a large variety of event listeners.

These can be used to fire custom functionality when a specific lifecycle event occurs.

## `analytics.on`

Using the `.on` listener will fire a callback every time the event occurs.

```js
analytics.on('pageEnd', ({ payload }) => {
  console.log('event payload', payload)
  // Do your custom logic
  alert('Page view happened')
})
```


## `analytics.once`

Using the `.once` listener will fire a callback once and only once.

```js
analytics.once('track', ({ payload }) => {
  console.log('event payload', payload)
  alert('Track call happened. Call this only once')
})
```

## Detaching listeners

You can detach listeners by calling the function they return.


```js
function myCustomCallback({ payload }) {
  /* Custom business logic */
}

const removeListener = analytics.on('identify', myCustomCallback)

// Remove listener
removeListener()

// `myCustomCallback` will no longer trigger
```
