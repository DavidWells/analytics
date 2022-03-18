---
title: "Using Analytics with React & React Router"
description: Example of how to use analytics with react router
pageTitle: Using with React Router
subTitle: Example of how to use analytics with react router
---

Below is a tutorial on using `analytics` with `react-router`

First, initialize analytics with your providers or custom plugins.

```js
// analytics.js
import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const myPlugin = {
  name: 'my-custom-plugin',
  page: ({ payload }) => {
    console.log('page view fired', payload)
  },
  track: ({ payload }) => {
    console.log('track event payload', payload)
  }
}

const analyticsInstance = Analytics({
  app: 'my-app',
  plugins: [
    myPlugin,
    googleAnalytics({
      trackingId: 'UA-XYZ-123'
    })
  ]
})

export default analyticsInstance
```

Then, initialize your react app with the `AnalyticsProvider` to enable `useAnalytics` hook in your application

```js
// main entry point
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { AnalyticsProvider } from "use-analytics"
import App from './App'
import analytics from './analytics'

ReactDOM.render(
  <React.StrictMode>
    <AnalyticsProvider instance={analytics}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AnalyticsProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
```

Then use the `useLocation` hook to listen for route changes to send page views.

```js
// App.js
import React, { useEffect } from "react"
import { Route, Routes, useLocation, NavLink } from "react-router-dom"
import { useAnalytics } from "use-analytics"
import Home from "./components/Home"
import AboutPage from "./components/About"
import OtherPage from "./components/Other"
import Navbar from "./components/Navbar"

export default function App() {
  const location = useLocation()
  const analytics = useAnalytics()

  useEffect(() => {
    // send page view on route change
    analytics.page()
  }, [location])

  return (
    <div>
      <nav>
        <NavLink to='/'>Home</NavLink>
        <NavLink to='/about'>About</NavLink>
        <NavLink to='/other'>Other Page</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<AboutPage />}/>
        <Route path="/other" element={<LoginNew />}/>
      </Routes>
    </div>
  )
}
```

Using `useAnalytics` in sub pages

```js
// ./components/About.js
import React from "react"
import { useAnalytics } from "use-analytics"

export default function AboutPage() {
  const analytics = useAnalytics()

  function handleClick(event) {
    analytics.track('ButtonClicked', {
      text: event.target.innerText
    })
  }
  
  return (
    <div>
      <h1>About page</h1>
      <button onClick={handleClick}>
        Click me
      </button>
    </div>
  )
}
```

Alternatively, you can call the analytics instance directly like so:

```js
// ./components/Other.js
import React from "react"
import analytics from "../analytics"

function handleClick(event) {
  analytics.track("ButtonClicked", {
    text: event.target.innerText
  })
}

export default function OtherPage() {
  return (
    <div>
      <h1>About page</h1>
      <button onClick={handleClick}>Click me</button>
    </div>
  )
}
```
