---
title: Tab Events
description: Using the tab events plugin
---

> Fire events on tab visibility changes

## Usage

```bash
npm install analytics analytics-plugin-tab-events
```

```js
import Analytics from 'analytics'
import tabEventsPlugin from 'analytics-plugin-tab-events'

let tabInterval

const analytics = Analytics({
  app: 'my-app',
  plugins: [
    /* Include tab events plugin */
    tabEventsPlugin,
    /* Example plugin that listener to tab events */
    {
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
    },
  ]
})

/* Alternatively you can listen with .on listener */
analytics.on('tabHidden', () => {
  // do stuff when tab hidden
})

analytics.on('tabVisible', () => {
  // do stuff when tab visible
})
```
