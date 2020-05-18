---
title: 'Sending events to a specific analytics provider'
description: Customize where data is sent on a per-call basis
pageTitle: Send provider-specific events
subTitle: Customizing where data is sent on a per-call basis
---

Often times, you might want to send only specific `page`, `track`, or `identify` calls only to a single specific analytics provider.

By default, when analytics is initialized with multiple [plugins](http://getanalytics.io/plugins), any `page`, `track`, or `identity` call will send the data to every plugin with that corresponding method.

You can disable this default behavior by using the `options` parameter for `page`, `track`, or `identify`.

`options.plugins` will enabling or disable sending data to a specific analytics tool.

## Single identify destination

Here is an example of how to disable all other `identify` calls except for the `hubspot` plugin.

Set `all` to `false` and whichever plugin you would like to send data to as `true`.

```js
/* Send identify call to one 1 place */
const additionUserTraits = {
  color: 'blue',
  email: 'bob@bob.com'
}
analytics.identify('userId-123', additionUserTraits, {
 plugins: {
   // disable this specific identify in all plugins except hubspot
   all: false,
   hubspot: true
 }
})
```

## Single track destination

Here is an example of how to disable all other `track` calls except for the `customerio` plugin.

Set `all` to `false` and whichever plugin you would like to send data to as `true`.

```js
/* Send track call to one 1 place */
const additionEventProps = {
  price: 11,
  sku: '1234'
}
analytics.track('eventName', additionEventProps, {
  plugins: {
    // disable this specific track call for all plugins except customerio
    all: false,
    customerio: true
  }
})
```

## Single page destination

Here is an example of how to disable all other `page` calls except for the `google-analytics` plugin.

Set `all` to `false` and whichever plugin you would like to send data to as `true`.

```js
/* Send page call to one 1 place */
analytics.page({}, {
 plugins: {
   // disable this specific page in all plugins except google-analytics
   all: false,
   'google-analytics': true
 }
})
```

## Disabling destinations

Perhaps you want to exclude a provider or 2 from a specific call, the same `options` apply.

Set whichever plugin should not be fired in the `options.plugins` value.

```js
analytics.track('eventName', {}, {
  plugins: {
    // disable `google-analytics` & `hubspot` from receiving this specific `analytics.track` call
    'google-analytics': false,
    'hubspot': false
  }
})
```

## Full example

For example, here we have an analytics instance with [Google Analytics](https://getanalytics.io/plugins/google-analytics/), [HubSpot](https://getanalytics.io/plugins/hubspot/), and [customerio](https://getanalytics.io/plugins/customerio/).

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'
import customerIo from '@analytics/customerio'
import hubSpot from '@analytics/hubspot'

/* Initialize analytics with 3 plugins */
const analytics = Analytics({
  app: 'app-name',
  plugins: [
    // Attach analytic provider plugins
    googleAnalytics({
      trackingId: '123-xyz'
    }),
    hubSpot({
      portalId: '234576'
    })
    customerIo({
      siteId: '123-xyz'
    })
  ]
})
```

If we were to call `analytics.track('buttonClicked')`, this event would send to all 3 providers.

To only send that specific `buttonClicked` event to a single provider, let's use the `options.plugins` object.


```js
const payload = {} // empty payload in this example
const trackOptions = {
  plugins: {
    all: false, // <-- tell analytics to disable all tracking calls in all attached plugins
    hubspot: true // <-- Enable tracking calls only for hubspot
  }
}
analytics.track('buttonClicked', {}, trackOptions)
```
