# FullStory plugin for `analytics`

Integration with [FullStory](https://www.fullstory.com/) for [analytics](https://www.npmjs.com/package/analytics)

<!-- ANALYTICS_DOCS:START (TOC) -->
- [Usage](#usage)
- [Formatting Identify & Tracking payloads](#formatting-identify--tracking-payloads)
- [Configuration](#configuration)
- [Plugin Options](#plugin-options)
<!-- ANALYTICS_DOCS:END (TOC) -->

## Usage

Install `analytics` and `@analytics/fullstory` packages

```bash
npm install analytics
npm install @analytics/fullstory
```

Import and initialize in project

```js
import Analytics from 'analytics'
import fullStoryPlugin from '@analytics/fullstory'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    fullStoryPlugin({
      /* org name from Full Story settings */
      org: 'ABCDE'
    })
  ]
})

/* Track custom events */
analytics.track('itemPurchased', {
  price: 11.50,
  is_user: true
})

/* Identify visitors */
analytics.identify('user-xzy-123', {
  email: 'bill@murray.com',
  accountLevel: 'pro'
})
```

## Formatting Identify & Tracking payloads

Full story requires [specific naming conventions](https://help.fullstory.com/hc/en-us/articles/360020623234) for tracking.

We have taken the liberty of making this easier to use with this plugin. 🎉

Values sent to Full Story will be automatically converted into a values their API will understand.

**Example**

```js
analytics.track('itemPurchased', {
  price: 11.11,
  is_user: true,
  first_name: 'steve'
})
```

This tracking payload will be automatically converted to the [fullstory naming conventions](https://help.fullstory.com/hc/en-us/articles/360020623234) and will be sent like:

```js
FS.event('itemPurchased', {
  price_real: 11.11,
  isUser_bool: true,
  firstName_str: 'steve'
})
```

This will ensure data flows into full story correctly.

## Configuration

Below are the configuration options for the analytics full story plugin.

You will need your `org` ID from [full story setting](https://help.fullstory.com/hc/en-us/articles/360020623514-How-do-I-get-FullStory-up-and-running-on-my-site-) to connect to your account.

First, find your FullStory account's `org` ID by clicking on **Settings > FullStory Setup.** and viewing the `_fs_org` value.

<!-- ANALYTICS_DOCS:START (API) -->
## Plugin Options

**Arguments**

- **pluginConfig** <code>object</code> - Plugin settings
- **pluginConfig.org** <code>string</code> - FullStory account's `org` ID. The `_fs_org` value in settings.

**Example**

```js
fullStoryPlugin({
  org: 'your-org-name'
})
```
<!-- ANALYTICS_DOCS:END -->
