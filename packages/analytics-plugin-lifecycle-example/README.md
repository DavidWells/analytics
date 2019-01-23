# Analytics lifecycle example Plugin

> Example plugin showcasing the various lifecycle methods a plugin can hook into

## Usage

```bash
npm install analytics analytics-plugin-lifecycle-example
```

```js
import Analytics from 'analytics'
import lifecycleExample from 'analytics-plugin-lifecycle-example'

const analytics = Analytics({
  app: 'my-app',
  plugins: [
    lifecycleExample(),
  ]
})
```
