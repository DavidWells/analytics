<!--
title: Quala
description: Using the quala plugin
-->

# Quala plugin for `analytics`

Integration with [quala](https://quala.io/) for [analytics](https://www.npmjs.com/package/analytics)

For more information [see the docs](https://getanalytics.io/plugins/quala/).

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Installation](#installation)
- [How to use](#how-to-use)
- [Platforms Supported](#platforms-supported)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

```bash
npm install analytics
npm install @analytics/quala
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->

## How to use

The `@analytics/quala` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage). To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the browser plugin. You must pass `writeKey` to the plugin.

```js
import Analytics from "analytics";
import qualaPlugin from "@analytics/quala";

const analytics = Analytics({
  app: "awesome-app",
  plugins: [
    qualaPlugin({
      writeKey: "123-xyz",
    }),
    // ... more plugins
  ],
});

/* Track a page view */
analytics.page();

/* Track a custom event */
analytics.track("cartCheckout", {
  item: "pink socks",
  price: 20,
  companyId: "123-xyz",
});

/* Identify a visitor */
analytics.identify("user-id-xyz", {
  firstName: "bill",
  lastName: "murray",
  companyId: "123-xyz",
});
```

After initializing `analytics` with the `qualaPlugin` plugin, data will be sent into Quala whenever [analytics.page](https://getanalytics.io/api/#analyticspage), [analytics.track](https://getanalytics.io/api/#analyticstrack), or [analytics.identify](https://getanalytics.io/api/#analyticsidentify) are called.

See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The `@analytics/quala` package works in [the browser](#browser-usage) and [server-side in Node.js](#server-side-usage)
