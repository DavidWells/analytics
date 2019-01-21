# Analytics Tab Events Plugin

> Fire events on tab visibility changes

## Usage

```bash
npm install analytics analytics-plugin-tab-events
```

```js
import Analytics from 'analytics'
import tabEvents from 'analytics-plugin-tab-events'

const analytics = Analytics({
  app: 'my-app',
  plugins: [
    tabEvents,
  ]
})

analytics.on('tabHidden', () => {
  // do stuff
})

analytics.on('tabVisible', () => {
  // do stuff
})
```
