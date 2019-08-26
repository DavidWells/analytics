# Event Validation for analytics

Validation for tracking events with [analytics](https://npmjs.com/package/analytics).

This ensures events passing through to third party analytic tools are valid and conform to naming conventions.

## About

[Using event naming conventions to keep analytics data clean](https://davidwells.io/blog/clean-analytics)

This library ensures tracking events for [analytics](https://npmjs.com/package/analytics) match this opinionated pattern:

```
context:objectName_actionName
```

This is customizable via custom plugins for analytics.

## Pattern

`Product (or context) => Object => Action`

The format answers these questions:

- Where is the event from?
- What is the event effecting?
- What was the action taken?

**Some event examples:**

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

## Usage

```js
import Analytics from 'analytics'
import eventValidation from 'analytics-plugin-event-validation'
import customerIOPlugin from 'analytics-plugin-customerio'

const analytics = Analytics({
  app: 'awesomesauce',
  plugins: [
    eventValidation({
      // Namespace of current application
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
import googleAnalytics from 'analytics-plugin-ga'

const customValidationPlugin = {
  NAMESPACE: 'company-xyz-event-validation',
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

See the [full list of analytics provider plugins](https://github.com/DavidWells/analytics#current-plugins) in the main repo.
