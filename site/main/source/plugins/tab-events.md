---
title: Listen & react to tab visibility events in analytics
pageTitle: Tab Events
description: Using the tab events plugin
---

This plugin will expose tab events for listeners and other plugins to react to when tab visibility changes.

Tab visibility changes can be useful for session information, pausing videos/carousels, and diplaying calls to action when a visitor returns to a tab.

After installing & activating the plugin, the `tabHidden` and `tabVisible` events will fire.

You can listen to these events via additional plugins or with `.on` & `.once` listeners.

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

You can listen to the `tabHidden` and `tabVisible` events with `.on` & `.once` listeners directly in your application code.

```js
/* import analytic instance in your app code */
import analytics from '/src/analytics'

/*
  Somewhere in your app
*/

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
  NAMESPACE: 'custom-plugin-with-tab-listeners',
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
