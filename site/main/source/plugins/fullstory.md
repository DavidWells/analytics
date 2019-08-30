---
title: FullStory
subTitle: Using the FullStory plugin
description: Integrate FullStory visitor tracking with the open source analytics module
---

FullStory enables pixel perfect replays of what your visitor is doing on your website or app. It can give you deep insight into user flows & potential bottlenecks of your applications.

## How to use

Install `analytics` and `analytics-plugin-fullstory` packages

```bash
npm install analytics
npm install analytics-plugin-fullstory
```

Import and initialize in your project

```js
import Analytics from 'analytics'
import fullStoryPlugin from 'analytics-plugin-fullstory'

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

## Configuration

Below are the configuration options for the analytics full story plugin.

You will need your `org` ID from [full story setting](https://help.fullstory.com/hc/en-us/articles/360020623514-How-do-I-get-FullStory-up-and-running-on-my-site-) to connect to your account.

First, find your FullStory account's `org` ID by clicking on **Settings > FullStory Setup.** and viewing the `_fs_org` value.

**Arguments**

- **pluginConfig** <code>object</code> - Plugin settings
- **pluginConfig.org** <code>string</code> - FullStory account's `org` ID. The `_fs_org` value in settings.

**Example**

```js
fullStoryPlugin({
  org: 'NRVXW' // org name from Full Story settings
})
```

## Event Formatting Details

Full story requires [specific naming conventions](https://help.fullstory.com/hc/en-us/articles/360020623234) for tracking.

Luckily, we have taken the liberty of making this easier to use with this plugin. 🎉

Values sent to Full Story will be automatically converted into a values their API will understand.

**Example**

```js
analytics.track('itemPurchased', {
  price: 11.11,
  is_user: true,
  first_name: 'steve'
})
```

The above tracking payload will be automatically converted to the [fullstory naming conventions](https://help.fullstory.com/hc/en-us/articles/360020623234) that FullStory will save. Under the hood analytics is sending the event like so:

```js
FS.event('itemPurchased', {
  price_real: 11.11,
  isUser_bool: true,
  firstName_str: 'steve'
})
```

This will ensure data flows into full story correctly.
