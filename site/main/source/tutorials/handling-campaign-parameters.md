---
title: 'Fire custom logic for UTM campaign parameters'
description: Listen for UTM campaign parameters and trigger custom logic with an analytics plugin or listener
pageTitle: Handling campaign parameters
subTitle: Listen for UTM campaign parameters with a plugin or listener
---

`UTM` tracking tokens are commonly used for measuring the effectiveness of marketing campaigns. They are handy when running ads, sending emails, and tracking traffic from external sources.

When using the [google analytics plugin](https://getanalytics.io/plugins/google-analytics/), these UTM parameters are automatically sent into google analytics.

> But, what if we want to save the campaign data in other tools?

We can use the analytics plugin system or event listeners to do this!

## The `campaign` event

In the [analytics lifecycle](https://getanalytics.io/lifecycle/), there is a **campaign** event that is emitted if there are `UTM` parameters found in the current URL.

This **campaign** event can be hooked into with a [plugin](https://getanalytics.io/plugins/writing-plugins/) or a [listener](https://getanalytics.io/using-listeners/).

## Using a custom plugin

1. Create a custom plugin
2. Attach the plugin to analytics when it's initialized

```js
import Analytics from 'analytics'

/* 1. Create the plugin & functionality you want to trigger */
const customPlugin = {
  // All plugins have a name
  name: 'save-campaign-data',
  // Attach a function to the 'campaign' event
  campaign: ({ payload }) => {
    console.log('utm data', payload.campaign)
    // Send data elsewhere, save to localStorage etc.
  }
}

/* 2. Attach the plugin to the plugins array when you initialize analytics */
const analytics = Analytics({
  app: 'app-name',
  plugins: [
    customPlugin,
    // ... other plugins
  ]
})
```

After attaching the plugin, anytime `UTM` parameters are found in a URL, this functionality will trigger.

**For example:**

`?utm_source=a&utm_medium=b&utm_term=c&utm_content=d&utm_campaign=e`

Will fire the `campaign` event with the payload

```js
const customPlugin = {
  name: 'save-campaign-data',
  campaign: ({ payload }) => {
    console.log('utm data', payload.campaign)
    /*{
      source: 'a',
      medium 'b',
      term: 'c',
      content 'd',
      name: 'e'
    }*/
  }
}
```

## Using a Listener

You can also react to the `campaign` event via a listener anywhere in your application code.

1. Initialize analytics
2. Set a listener with `on` or `once` to listen for the `campaign` event

```js
import Analytics from 'analytics'

const analytics = Analytics({
  app: 'app-name',
  plugins: [
    // ... other plugins
  ]
})

/* Attach a listener to campaign */
analytics.on('campaign', ({ payload }) => {
  console.log('utm data', payload.campaign)
  // Send data elsewhere, save to localStorage etc.
})
```

You can also use the `once` listener to ensure a callback is fired only one time.

```js
/* Alternatively Attach a listener to campaign */
analytics.once('campaign', ({ payload }) => {
  console.log('utm data', payload.campaign)
  // Send data elsewhere, save to localStorage etc.
})
```
