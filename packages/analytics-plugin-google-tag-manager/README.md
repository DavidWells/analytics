# Google analytics plugin for `analytics`

Integration with google tag manager for [analytics](https://www.npmjs.com/package/analytics)

## Install

```bash
npm install analytics-plugin-google-tag-manager --save
```

## Usage

```js
import Analytics from 'analytics'
import googleTagManager from 'analytics-plugin-google-tag-manager'

const analytics = Analytics({
  app: 'awesome-app',
  version: 100,
  plugins: [
    googleTagManager({
      containerId: 'Your-containerId'
    })
  ]
})
```

## Setup

Make sure you have your google tags manager setup to fire on Page views.

If you are using a SPA you want to listen to history changes as well.

![image](https://user-images.githubusercontent.com/532272/52185417-538fe500-27d4-11e9-9500-abf702e5d802.png)

See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
