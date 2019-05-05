---
title: Getting Started with analytics
---

# Getting Started

This guide will walk you though installing and hooking up analytics

## Installation

1. **Install analytics**

    ```bash
    npm install analytics --save
    ```

2. Include `analytics` in your project

    Import `analytics` and initialize the library with the analytics plugins of your choice.

    ```js
    /* src/analyticsInstance.js */
    import analyticsLib from 'analytics'

    const analytics = analyticsLib({
      app: 'app-name',
      plugins: [
        // ... your analytics integrations
      ]
    })

    export default analytics
    ```

3. Use in code

    ```js
    import analytics from './analyticsInstance'

    /* Track page views */
    analytics.page()

    /* Identify users */
    analytics.identify('userid-123', {
      favoriteColor: 'blue',
      membershipLevel: 'pro'
    })

    /* Track events */
    analytics.track('buttonClicked', {
      value: 100
    })
    ```

## Usage in React

Checkout the [demo example](https://github.com/DavidWells/analytics/tree/master/examples/demo) for how to include and use analytics in a react project.
