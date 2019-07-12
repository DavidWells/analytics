# Analytics Do Not Track Plugin

> Disable analytics tracking for opted out visitors

This `analytics` plugin will disable `page`, `track`, & `identify` calls for visitors using [Do Not Track](https://caniuse.com/#feat=do-not-track).

## Usage

```bash
npm install analytics analytics-plugin-do-not-track
```

```js
import Analytics from 'analytics'
import doNotTrack from 'analytics-plugin-do-not-track'

const analytics = Analytics({
  app: 'my-app',
  plugins: [
    doNotTrack(),
  ]
})
```
