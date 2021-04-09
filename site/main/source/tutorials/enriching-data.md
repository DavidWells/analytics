---
title: 'Enrich tracking data sent to a specific analytics provider'
description: Customize payloads by a specific analytics tool using the analytics lifecycle & namespaced plugin methods
pageTitle: Enrich data for specific tools
subTitle: Customizing tracking payloads with namespaced plugin methods
---

Let's say we are sending `track` calls into 3 different analytic tools, [Google analytics](https://getanalytics.io/plugins/google-analytics/), [Customer.io](https://getanalytics.io/plugins/customerio/) and [HubSpot](https://getanalytics.io/plugins/hubspot/).

What if we want to **alter & enrich the data specifically for HubSpot** and not send the same information to Google Analytics & Customer.io?

You can write a plugin to achieve this!

## Namespaced plugin methods

In the [analytics lifecycle](https://getanalytics.io/lifecycle/), event payloads are scoped to a given plugin and we can attach middleware to effect a single plugin.

This means we can enrich, cancel, or alter calls to a specific provider based on any conditions.

Some examples:

- If the user has opted out of a specific tool. `NoOp` the tracking call to that tool
- If a given tool needs a specific piece of information but you don't want to send it everywhere
- If specific tools require values that others might fail on.
- etc.

Going back to the original scenario, we need to add an additional field to the data sent to HubSpot when we call `analytics.track()`. This will ensure the additional value is sent to HubSpot but not the other tools.

To do this, we need a new custom plugin that attaches to a **namespaced event**.

Namespaced event keys look like this: `event:PluginName`

So, we need to create a plugin that adds a `track:hubspot` function that will alter the payload that the `@analytics/hubspot` tracking function gets.

This flow looks like this:

<img src="https://d36ubspakw5kl4.cloudfront.net/images/enriching-payloads.png" />


## Plugin Example

The plugin code would look like this:

```js
const customEnricherPlugin = {
  name: 'enrich-hubspot',
  // Attach event to ONLY HubSpot tracking calls
  'track:hubspot': ({ payload }) => {
    const enrichedProperties = Object.assign({}, payload.properties, {
      dataJustForHubspot: 'hubspot only data'
    })
    // Return updated object. This will flow into the HubSpot tracking call
    return Object.assign({}, payload, { properties: enrichedProperties })
  }
}
```

The `track:hubspot` function will be called directly before the HubSpot plugin sends it's tracking information off to the HubSpot backend.

For this to work, we need to attach the plugin when `analytics` is initialized.

## Using in your app

1. Create the custom plugin
2. Attach the plugin to analytics during initialization
3. Call `analytics.track()` in your application

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'
import customerIo from '@analytics/customerio'
import hubSpot from '@analytics/hubspot'

/* 1. Create a plugin that attaches to the `track:hubspot` call */
const customEnricherPlugin = {
  name: 'enrich-hubspot',
  // Attach event to ONLY HubSpot tracking calls
  'track:hubspot': ({ payload }) => {
    const enrichedProperties = Object.assign({}, payload.properties, {
      dataJustForHubspot: 'hubspot only data'
    })
    // Return updated object. This will flow into the HubSpot tracking call
    return Object.assign({}, payload, { properties: enrichedProperties })
  }
}

/* 2. Attach the plugin to the plugins array when you initialize analytics */
const analytics = Analytics({
  app: 'app-name',
  plugins: [
    // Attach enricher plugin before provider plugins
    customEnricherPlugin,
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

/* 3. Call analytics.track in your application */
analytics.track()
// Inside the payload sent to the hubspot Plugin, there is a new
```

In the example above, HubSpot will receive a `dataJustForHubspot` value in tracking calls while Google Analytics and Customer.io will not.
