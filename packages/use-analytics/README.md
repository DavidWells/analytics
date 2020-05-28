<!--
title: React hooks for analytics
description: Integrating analytics into your react apps with use-analytics
-->
# useAnalytics React Hooks

React hooks for [analytics](https://www.npmjs.com/package/analytics). This library adds some convenience methods when working with React & makes it a little easier to passing around the `analytics` instance while instrumenting your application.

Note: When using `analytics` with React, this library, `use-analytics`, hooks library is **not** required. See details below for [using analytics with react without hooks.](https://getanalytics.io/utils/react-hooks/#without-hooks)

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Installation](#installation)
- [How to use](#how-to-use)
- [Demo video](#demo-video)
- [`useAnalytics` hook](#useanalytics-hook)
- [`AnalyticsConsumer`](#analyticsconsumer)
- [`withAnalytics`](#withanalytics)
- [`AnalyticsContext`](#analyticscontext)
- [Analytics without hooks](#analytics-without-hooks)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Installation

Install `analytics`, `use-analytics` from [npm](https://www.npmjs.com/package/use-analytics).

```
npm install analytics use-analytics
```

## How to use

After installing the `analytics` and `use-analytics`, include in your project.

Initialize `analytics` with your [third-party plugins](https://getanalytics.io/plugins/) or [custom plugins](https://getanalytics.io/plugins/writing-plugins/) and pass it to the `<AnalyticsProvider>` component in the `instance` prop.

Wrapping your application with `<AnalyticsProvider>` is required for using `use-analytics` hooks.

```js
import React from 'react'
import ReactDOM from 'react-dom'
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'
import { AnalyticsProvider, useAnalytics } from 'use-analytics'

/* Initialize analytics & load plugins */
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: 'UA-1234567',
    })
  ]
})

const Example = (props) => {
  const { track, page, identify } = useAnalytics()
  return (
    <div>
      <button onClick={() => track('trackThing')}>
        Track event
      </button>
      <button onClick={() => page()}>
        Trigger page view
      </button>
      <button onClick={() => identify('userID', { email: 'bob@bob.com' })}>
        Trigger identify visitor
      </button>
    </div>
  )
}

ReactDOM.render((
  <AnalyticsProvider instance={analytics}>
    <Example />
  </AnalyticsProvider>
), document.getElementById('root'))
```

For more information on how to use, checkout this [example repo](https://github.com/DavidWells/use-analytics-with-react-router-demo).

## Demo video

<iframe width="768" height="432" src="https://www.youtube.com/embed/C_1ced3l9cU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## `useAnalytics` hook

After the `AnalyticsProvider` is added to your application you can use the `useAnalytics` hook anywhere down the component tree.

```js
import React from 'react'
import { useAnalytics } from 'use-analytics'

const Example = (props) => {
  const { track, page, identify } = useAnalytics()
  return (
    <div>
      <button onClick={() => track('trackThing')}>
        Track event
      </button>
      <button onClick={() => page()}>
        Trigger page view
      </button>
      <button onClick={() => identify('userID', { email: 'bob@bob.com' })}>
        Trigger identify visitor
      </button>
    </div>
  )
}
```

## `AnalyticsConsumer`

Below is an example of using render props and the `AnalyticsConsumer` functional component and the render props pattern.

```js
import React from 'react'
import ReactDOM from 'react-dom'
import Analytics from 'analytics'
import { AnalyticsProvider, AnalyticsConsumer } from 'use-analytics'

/* Initialize analytics & load plugins */
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: 'UA-1234567',
    })
  ]
})

ReactDOM.render((
  <AnalyticsProvider instance={analytics}>
    <AnalyticsConsumer>
      {(props) => {
        /* props contains the analytics API. https://getanalytics.io/api/*/
        const { track, page, identify, user } = props
        return (
          <div>
            <button onClick={() => track('trackThing')}>
              Track event
            </button>
            <button onClick={() => page()}>
              Trigger page view
            </button>
            <button onClick={() => identify('userID', { email: 'bob@bob.com' })}>
              Trigger identify visitor
            </button>
          </div>
        )
      }}
    </AnalyticsConsumer>
  </AnalyticsProvider>
), document.getElementById('root'))
```

## `withAnalytics`

It's also possible to use `withAnalytics` higher order component to wrap components inside the `<AnalyticsProvider />` component.

This will inject the analytics instance into `this.props.analytics`

Below is an example of using `withAnalytics`

```js
import React, { Component } from 'react'
import { withAnalytics } from 'use-analytics'

class App extends Component {
  render() {
    /* props.analytics contains the analytics API https://getanalytics.io/api/*/
    const { analytics } = this.props
    const { track, page, identify } = analytics
    return (
      <div className="App">
        <div>
          <button onClick={() => track('trackThing')}>
            Track event
          </button>
          <button onClick={() => page()}>
            Trigger page view
          </button>
          <button onClick={() => identify('userID', { email: 'bob@bob.com' })}>
            Trigger identify visitor
          </button>
        </div>
      </div>
    )
  }
}

export default withAnalytics(App)
```


## `AnalyticsContext`

If you are using React class components, you can leverage the [static contextType](https://reactjs.org/docs/context.html#classcontexttype) field and set the `AnalyticsContext`.

```js
import React from 'react'
import ReactDOM from 'react-dom'
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'
import { AnalyticsProvider, AnalyticsContext } from 'use-analytics'

/* Initialize analytics & load plugins */
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: 'UA-1234567',
    })
  ]
})

/* Example of class component using contextType */
class ComponentWithContextType extends React.Component {
  static contextType = AnalyticsContext
  render = () => {
    /* this.context contains the analytics API https://getanalytics.io/api/*/
    const { track, page, identify } = this.context
    return (
      <div>
        <button onClick={() => track('trackThing')}>
          Track event
        </button>
        <button onClick={() => page()}>
          Trigger page view
        </button>
        <button onClick={() => identify('userID', { email: 'bob@bob.com' })}>
          Trigger identify visitor
        </button>
      </div>
    )
  }
}

ReactDOM.render((
  <AnalyticsProvider instance={analytics}>
    <ComponentWithContextType />
  </AnalyticsProvider>
), document.getElementById('root'))
```


## Analytics without hooks

Analytics works as a standalone package & the analytics instance can be imported into directly into any component and used.

```js
// index.js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'

ReactDOM.render(MyComponent, document.getElementById('root'))
```

Then include a file where analytics is initialize & export the instance. This will be the file you include wherever you want to instrument custom events.

```js
// analytics.js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'
/* Initialize analytics & load plugins */
const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    googleAnalytics({
      trackingId: 'UA-1234567',
    })
  ]
})

export default analytics
```

For example, `app.js` below is including the analytics instance and can call the methods directly.

```js
// app.js
import React from 'react'
import analytics from './analytics'

const MyComponent = (
  <div>
    <button onClick={() => analytics.track('trackThing')}>
      Track event
    </button>
    <button onClick={() => analytics.page()}>
      Trigger page view
    </button>
    <button onClick={() => analytics.identify('userID')}>
      Trigger identify visitor
    </button>
  </div>
)

export default MyComponent
```
