---
title: Frequently Asked Questions
description: Common questions asked about analytics
---

## Do I need to use a plugin?

No, analytics will work out of the box without any plugins attached. However the data from `page`, `track`, and `identify` calls won't send information anywhere.

You can attach your own data collection method via an inline plugin

```js
{
  name: 'custom-analytics-plugin',
  page: ({ payload }) => {
    const customAnalyticsEndpoint = 'https://your-custom-analytics-collection-endpoint.com'
    const { meta, properties, anonymousId, userId } = payload
    // Send data to custom collection endpoint
    fetch(customAnalyticsEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        date: meta.ts
        title: properties.title
        anonymousId: anonymousId,
        userId: userId,
      })
    })
  }
}
```

## How much bundle size will this add?

The [analytics](https://bundlephobia.com/result?p=analytics) package is [~**13.2kb** minified + gzipped](https://bundlephobia.com/result?p=analytics)

If you are not persisting data in `localStorage` or `cookies`, you can use [@analytics/core](https://bundlephobia.com/result?p=@analytics/core). This brings the pkg down to **`~12.6kb`** minified + gzipped.

## How is this different than Segment?

Segment's [`analytics.js`](https://github.com/segmentio/analytics.js/) is a great open-source project & a big inspiration behind the [analytics](https://www.npmjs.com/package/analytics) package. The analytics package can work with segment's existing library.

This library focuses solely on the javascript ecosystem, while [Segment](https://segment.com) offers a wide array of server-side analytic tools & SDK in other languages.

This library can send analytics & telemetry [anywhere](https://getanalytics.io/#about-the-library), it's easy to send data to segment.com & to any other analytics provider or your own backend. So, if you are using segment.com, this library works with it via the [segment plugin](https://getanalytics.io/plugins/segment/).

Let me repeat that, this library is compatible with Segment's analytics.js via the [segment plugin](https://getanalytics.io/plugins/segment/). 🎉

Below are some other considerations that lead to the creation of this open source analytics package:

### 1. Cost

Segment can get **prohibitively expensive** for marketing sites, blogs, and higher traffic applications. This makes it harder to use out of the box.

This lead the creation of the [segment plugin](https://getanalytics.io/plugins/segment/) & the [`disableAnonymousTraffic`](https://getanalytics.io/plugins/segment/#browser-api) setting to lower Segment MTU bills.

It is possible to self host `analytics.js` but this leads to some of the other points below.

### 2. Library size

Segment's [`analytics.js`](https://github.com/segmentio/analytics.js/) is a much larger codebase. This analytics package was designed to be more modular, lightweight and tree shakable.

For a quick comparison of sizes:

- Segment's [`analytics.js`](https://bundlephobia.com/result?p=analytics.js) **~48.2kB** minified + gzipped
- The [`analytics`](https://bundlephobia.com/result?p=analytics) package is ~**13.8kB** minified + gzipped

### 3. Functional Codebase

`analytics` is designed as a functional code base with minimal dependancies.

### 4. Extensibility

In many cases, Segment's `analytics.js` wasn't as flexible as we'd hope for some business use cases.

Some Examples:

- Manipulating data specific ways for specific providers,
- Changing how data is persisted
- Reacting to more events
- etc.

This [`analytics`](https://getanalytics.io/) library was built to account for a **wide** variety of use cases making nearly everything customizable via it's [middleware design](https://getanalytics.io/lifecycle/).

Event's can be hooked into, payloads can be altered, called can be cancelled if certain criteria isn't met, and even other plugins can be hooked into.

### 5. Debuggability & developers experience

The Segment live debugger is great but I wanted a way to visualize + time travel debug analytics as I flow through my applications. This lead to the creation of [debug mode](https://getanalytics.io/debugging/) with `analytics`

## Does this work in browsers & on the server?

Yes, analytics was designed to work in browsers AND server-side for JavaScript runtimes.

## Other questions

Tweet Questions [@DavidWells](https://twitter.com/davidwells) or leave them in an [issue](https://github.com/DavidWells/analytics/issues)
