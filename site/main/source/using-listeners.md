---
title: Using Listeners
description: Listen & reacting to analytic lifecycle events
---

The `analytics` library comes with a large variety of event listeners.

These can be used to fire custom functionality when a specific lifecycle event occurs.

## Firing events with `.on`

Using the `.on` listener will fire a callback every time the event occurs.

```js
analytics.on('pageEnd', ({ payload }) => {
  console.log('event payload', payload)
  alert('Page view happened')
})
```

You can detach listeners by calling the function they return.

```js
const identifyListener = analytics.on('identify', ({ payload }) => {
  console.log('event payload', payload)
  alert('identify happened')
})

// Remove listener
identifyListener()
```

## Firing events once with `.once`

Using the `.once` listener will fire a callback once and only once.

```js
analytics.once('track', ({ payload }) => {
  console.log('event payload', payload)
  alert('Track call happened. Call this only once')
})
```
