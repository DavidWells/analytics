<!--
title: Adding Google Analytics to your app using open source analytics
description: Connect Google Analytics to the analytics library
pageTitle: Google Analytics
-->

# Google Analytics

This analytics plugin will load google analytics v.4 into your application.

For more information [see the docs](https://getanalytics.io/plugins/google-analytics/).

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
x
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

```bash
npm install analytics
npm install @analytics/google-analytics
```

<!-- AUTO-GENERATED-CONTENT:START (PLUGIN_DOCS) -->
x
<!-- AUTO-GENERATED-CONTENT:END (PLUGIN_DOCS) -->

## Fix "double page views"

Google analytics 4 sometimes automatically sends a page view for single page applications. To disable this you will need to go into the settings of your stream and click into "enhanced measurement" section and uncheck the "Page changes based on browser history events" setting. This will make sure only `analytics.page()` calls will send page views to Google analytics v4.

<img width="701" alt="disable-auto-spa-pageviews" src="https://user-images.githubusercontent.com/532272/180305960-b6172469-f3ee-4d48-85fd-3c4d0a07e777.png">

## Legacy Google analytics v3

For the older version of google analytics please see the `@analytics/google-analytics-v3` package