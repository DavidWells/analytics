# gatsby-plugin-analytics

Easily add [`analytics`](https://github.com/davidwells/analytics) to your Gatsby site.

## Install

```
npm install --save gatsby-plugin-analytics
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

    // Important! Set global 'Analytics' so Gatsby can automatically track page views on route changes
    window.Analytics = analytics

    /* export for consumption in your components for .track & .identify calls */
    export default analytics
    ```

    Important! Remember to expose to `window.Analytics` so Gatbsy can make the `analytics.page()` calls when route transitions happen.

3. **Import analytics**

    Import your `analytics.js` file into a root component to ensure that it is initialized and the `window.Analytics` is set.

4. **(Optionally), use `analytics.track` & `analytics.identify` in your site**

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
