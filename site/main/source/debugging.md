---
title: Time travel debugging for Analytics
description: Developer tools for debugging analytic instrumentation
pageTitle: Debug mode
subTitle: Debug in local development mode
---

A huge focus of the `analytics` project is an improved & streamlined developer experience.

The library comes with a powerful suite of [debug tools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) for local development.

Debug mode includes **time travel debugging** so devs can walk through call chains & debug how different plugins are making remote calls & effecting the lifecycle.

During development, you can turn on `debug` mode. This will connect [dev tools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) for devs to visually see the analytics events passing through the application.

![analytics-debug-tools](https://user-images.githubusercontent.com/532272/61163639-21da2300-a4c4-11e9-8743-b45d3a570271.gif)

## Enabling debug mode

By default, debug is off.

To enable debug mode, pass in the `debug` option to analytics.

```js
import Analytics from 'analytics'

const analytics = Analytics({
  app: 'my-app',
  // enable debug mode
  debug: true
})
```

## Disabling debug in production

To disable `debug` set to false or omitted from the options.

```js
import Analytics from 'analytics'

const analytics = Analytics({
  app: 'my-app',
  // disable debug mode
  debug: false
})
```

## Running debug in local dev only

To disable `debug` set to false.

Below is a handy snippet to run in debug mode only in local dev.

```js
import Analytics from 'analytics'

const analytics = Analytics({
  app: 'my-app',
  // enable debug mode
  debug: process.env.NODE_ENV === 'development'
})
```
