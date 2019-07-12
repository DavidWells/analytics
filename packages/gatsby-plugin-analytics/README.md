# gatsby-plugin-analytics

Add the [`analytics`](https://analytics-demo.netlify.com/) package to your Gatsby site.

[`analytics`](https://www.npmjs.com/package/analytics) is a lightweight analytics library for tracking events, page views, & identifying users. Works with any third party analytics provider via an extendable plugin system.

## Install

```
npm install gatsby-plugin-analytics
npm install analytics
```

## How to use

1. **Add the plugin to your `gatsby-config.js`**

    ```js
    plugins: [
      {
        resolve: `gatsby-plugin-analytics`,
      },
    ]
    ```

2. **Install `analytics` npm package & initialize in your site**

    Install [`analytics`](https://www.npmjs.com/package/analytics) in your Gatbsy site

    ```
    npm install analytics
    ```

    Then initialize it. Typically this is done in a `src/analytics.js` file. This is where we bootstrap analytics and any third party analytics tool we are using for our site.

    In the below example, we are using google tag manager and segment.com but analytics support any kind of third party integration. See [list of plugins](https://github.com/DavidWells/analytics#analytic-plugins)

    ```js
    /* analytics.js */
    import Analytics from 'analytics'
    import segmentPlugin from 'analytics-plugin-segment'
    import gtagManagerPlugin from 'analytics-plugin-google-tag-manager'
    // ... whatever analytics provider you use

    const analytics = Analytics({
      plugins: [
        gtagManagerPlugin({
          containerId: 'GTM-XYZ'
        }),
        segmentPlugin({
          writeKey: '123567',
        }),
      ]
    })

    // Set to global so analytics plugin will work with Gatsby
    if (typeof window !== 'undefined') {
      window.Analytics = analytics
    }

    /* export for consumption in your components for .track & .identify calls */
    export default analytics
    ```

    **Important!** Remember to expose to `window.Analytics` so Gatsby can make the `analytics.page()` calls when route transitions happen.

    Make sure to import this file into a base component so analytics loads on first page load.

## Using `track` & `identify`

If you want to `track` custom events or `identify` specific users, you can import your analytics instance and call the [`analytics` API](https://github.com/DavidWells/analytics#usage)

```js
import React, { Component } from 'react'
// path to your analytics instance
import analytics from '/analytics'

export default class App extends Component {
  doTrack = () => {
    analytics.track('buttonClicked', {
      foo: 'bar'
    })
  }
  doIdentify = () => {
    analytics.identify('xyz-777', {
      traitOne: 'blue',
      traitTwo: 'red',
    })
  }
  render() {
    const { history } = this.state
    return (
      <div className="App">
        <button onClick={this.doTrack}>
          Buy This Now
        </button>
        <button onClick={this.doIdentify}>
          Login
        </button>
      </div>
    )
  }
}
```

See the [demo site](https://analytics-demo.netlify.com/) and [src](https://github.com/DavidWells/analytics/tree/master/examples/demo) for more information
