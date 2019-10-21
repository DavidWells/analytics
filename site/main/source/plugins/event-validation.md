---
title: Add Event Validation to tracking events in analytics
description: How to validating tracking events before sending to third party analytic tools & keep data clean
pageTitle: Event Validation
subTitle: Validating events before sending to third parties
---

Validation for tracking events with [analytics](https://npmjs.com/package/analytics).

This ensures events passing through to third party analytic tools are valid and conform to naming conventions.

This plugin uses the conventions described in this post about [conventions to keep analytics data clean](https://davidwells.io/blog/clean-analytics)

## Pattern

`Context => Object => Action`

The format answers these questions:

- Where is the event from? `Context`
- What is the event effecting? `Object`
- What was the action taken? `Action`

Some examples of how this might look in various contexts:

- App => site => deployed
- App => function => invoked
- Site => docs => rated
- Site => docs => searched
- CLI => user => loggedIn
- API => user => passwordReset

### Format/Syntax

```
contextName:objectName_actionName
```

Here are some examples:

- `site:newsletter_subscribed`
- `app:site_deployed`
- `cli:user_login`
- `api:site_created`

For more information on this naming convention checkout this [post](https://davidwells.io/blog/clean-analytics)

If you'd like to bring your own validation, no problem! See [bringing your own validation](https://getanalytics.io/plugins/event-validation/#writing-your-own-validation)

## Install

```bash
npm install analytics
npm install analytics-plugin-event-validation
```

## Usage

```js
import Analytics from 'analytics'
import eventValidation from 'analytics-plugin-event-validation'
import customerIOPlugin from '@analytics/customerio'

const analytics = Analytics({
  app: 'awesomesauce',
  plugins: [
    eventValidation({
      // name of current application
      context: 'app',
      // Allowed objects
      objects: [
        'sites', // example app:sites_cdConfigured
        'user',  // example app:user_signup
        'widget' // example app:widget_created
      ]
    }),
    customerIOPlugin({
      siteId: '123-xyz'
    }),
  ]
})

// Event names must now conform to this format:
analytics.track('app:sites_whatever')
analytics.track('app:user_action')
analytics.track('app:widget_deleted')
```

## Writing your own validation

If you'd like to have your own naming conventions & rules for analytics, you can create another plugin like so:

```js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const customValidationPlugin = {
  name: 'company-xyz-event-validation',
  trackStart: ({ payload, abort }) => {
    // Your custom validation logic here
    if (!isEventValid(payload.event)) {
      // Abort the call or throw error in dev mode
      return abort('Event name does not meet validation requirements')
    }
  }
}

const analytics = Analytics({
  app: 'app-name',
  plugins: [
    customValidationPlugin,
    googleAnalytics({
      trackingId: 'UA-121991123',
    })
  ]
})
```
