# Analytics

This is a pluggable event driven analytics library designed to work with any third party analytics tool.

## Features

- [x] Pluggable via middleware. Bring your own third party tool
- [x] Works on client & server-side
- [ ] (WIP) In client, works offline. Queues events to send when connection resumes

##  Why

Companies frequently change their analytics requirements and add/remove services to their sites and applications. This can be a time consuming process integrating with N number of third party tools.

This library solves that.

##  Philosophy

> You should never be locked into a tool.

To add or remove an analytics provider simply remove it as middleware.

The provider integrations can be run independently of this library or plugged into other tools.

## Install

```bash
npm install analytics --save
```

## Usage

```js
import analyticsLib from 'analytics'
import googleAnalytics from 'analytics-plugin-ga'

const plugins = [
  googleAnalytics({
    trackingId: 'UA-121991291',
  })
]

const analytics = analyticsLib({
  app: 'my-app-name',
  version: 100,
  plugins: plugins
})

// page tracking
analytics.page()
// event tracking
analytics.track('userPurchase', {
  price: 20
})
// identifying users
analytics.identify('user-id-xyz', {
  firstName: 'bill',
  lastName: 'murray',
  email: 'da-coolest@aol.com'
})
//...
```

## Demo

Install the clone the https://github.com/DavidWells/analytics-example repo and give it a spin.

## Current plugins

- [Google Analytics](https://www.npmjs.com/package/analytics-plugin-ga)
- [Customer.io](https://www.npmjs.com/package/analytics-plugin-customerio)
- Add yours! 👇

##  Adding Analytics providers plugins

The library is designed to work with any third party analytics tool.

Here is an example:

```js
export default function googleAnalytics(config) {
  return {
    NAMESPACE: 'google-analytics',
    config: {
      whatever: 'youWant',
      googleAnalyticsId: config.id // 'UA-82833-33833'
    },
    initialize: function() {
      // load provider script to page (in browser)
    },
    page: function() {
      // call provider specific page tracking
    },
    track: function() {
      // call provider specific event tracking
    },
    identify: function() {
      // call provider specific user identify method
    },
    loaded: () => {
      // return boolean for loaded analytics library
      return !!window.gaplugins
    }
  }
}
```

Alternatively, you can also add whatever middleware functionality you'd like via redux middleware.

```js
// logger example
const logger = store => next => action => {
  if (action.type) {
    console.log(`>> dispatching ${action.type}`, JSON.stringify(action))
  }
  let result = next(action)

  return result
}

export default logger
```

##  Plugin naming conventions

Plugins should follow a naming convention like so:

`analytics-plugin-{your-plugin-name}`
