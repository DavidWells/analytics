---
title: Listen & react to tab visibility events in analytics
pageTitle: Tab Events
description: Reacting to browser tab visibility events
---

This [analytics](https://www.npmjs.com/package/analytics) plugin fire events on tab visibility changes. When visitors switch between browser tabs callbacks are fired.

Tab visibility changes can be useful for session information, pausing videos/carousels, and displaying calls to action when a visitor returns to a tab.

The plugin exposes tab events (`tabHidden` and `tabVisible`) that listeners & other plugins can react to.

This package comes with a standalone `onTabChange` function for usage anywhere in your app.

## How to use

Install from npm.

```bash
npm install analytics
npm install analytics-plugin-tab-events
```

Then initialize analytics with the plugin.

```js
import Analytics from 'analytics'
import tabEventsPlugin from 'analytics-plugin-tab-events'

const analytics = Analytics({
  app: 'my-app',
  plugins: [
    /* Include tab events plugin */
    tabEventsPlugin,
    // ...other plugins
  ]
})

// expose analytics instance for your app to use
export default analytics
```

## Reacting from listeners

You can listen to the `tabHidden` & `tabVisible` events with `.on` & `.once` listeners directly in your app code.

```js
/* import analytic instance in your app code */
import analytics from '/src/analytics'

// Somewhere in your app

/* Or fire .on listeners */
analytics.on('tabHidden', () => {
  // do stuff when tab hidden
})
analytics.on('tabVisible', () => {
  // do stuff when tab visible
})

/* Or fire listeners just once */
analytics.once('tabHidden', () => {
  // do stuff ONCE when tab hidden
})
analytics.once('tabVisible', () => {
  // do stuff ONCE when tab visible
})

/* Clean up events */
const remove = analytics.on('tabHidden', () => {/* logic */})
// Call remove() to detach listener
remove()
```

## Reacting from a plugin

Instead of listening inline with `.on` or `.once`, you can create plugins to also react to `tabHidden` and `tabVisible` events.

This keeps your app code nice an clean & centralizes functionality where your analytics instance is initialized.

**Here is an example:**

```js
import Analytics from 'analytics'
import tabEventsPlugin from 'analytics-plugin-tab-events'

let tabInterval
/* Example plugin that listener to tab events */
const customPluginExample = {
  name: 'custom-plugin-with-tab-listeners',
  tabHidden: () => {
    console.log('Tab is now hidden')
    let tabHiddenCount = 0
    tabInterval = setInterval(() => {
      console.log(`tab counter ${tabHiddenCount++}`)
    }, 500)
  },
  tabVisible: () => {
    console.log('Tab now visible again')
    clearInterval(tabInterval)
  },
}

const analytics = Analytics({
  app: 'my-app',
  plugins: [
    /* Include tab events plugin */
    tabEventsPlugin,
    /* Example plugin that listener to tab events */
    customPluginExample,
  ]
})
```

## Using `onTabChange`

This standalone `onTabChange` function can imported and used by itself, without the plugin being attached to `analytics`, anywhere in your application logic.

```js
import { onTabChange } from 'analytics-plugin-tab-events'

const myListener = onTabChange((isHidden) => {
  if (isHidden) {
    console.log('Tab is not visible')
  } else {
    console.log('Welcome back tab is visible')
  }
})

// Optionally remove the listener
myListener()
```
