# Google analytics plugin for `analytics`

Integration with google tag manager for [analytics](https://www.npmjs.com/package/analytics)

## Install

```bash
npm install analytics-plugin-google-tag-manager --save
```

## Usage

```js
import Analytics from 'analytics'
import gtagManager from 'analytics-plugin-google-tag-manager'

const analytics = Analytics({
  app: 'awesome-app',
  version: 100,
  plugins: [
    gtagManager()
  ]
})
```

See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
