---
title: Window Events
description: Using the window events plugin
---

> Fire events on window enter and window leave events

## Usage

```bash
npm install analytics
npm install analytics-plugin-window-events
```

After installing the plugin, the `windowLeft` and `windowEnter` events will fire.

You can listen to these events via additional plugins or with `.on` & `.once` listeners.

```js
import Analytics from 'analytics'
import windowEventsPlugin from 'analytics-plugin-window-events'

/* Example plugin that listener to window */
const customWindowListenerPlugin = {
  name: 'custom-window-listener-plugin',
  windowEnter: () => {
    console.log('Window entered do something via plugin')
  },
  windowLeft: () => {
    console.log('Window left do something via plugin')
  }
}

const analytics = Analytics({
  app: 'my-app',
  plugins: [
    windowEventsPlugin(),
    customWindowListenerPlugin
  ]
})

/* In app, use .on/.once listeners */
analytics.on('windowEnter', () => {
  // do stuff when visitor enters window
})

analytics.on('windowLeft', () => {
  // do stuff when visitor leaves window
})
```
