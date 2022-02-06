---
title: "Persisting page views"
description: Example of how to persist user page views between sessions on the client
pageTitle: Persisting page views
subTitle: How to persist user page views between sessions on the client
---

Below is an example on how to persist page views of a given visitor via [this idea](https://twitter.com/DavidWells/status/1447009803805487107) for improved docs.

```js
import Analytics from 'analytics'
import onRouteChange from '@analytics/router-utils'

const persistPageViewsPlugin = {
  name: 'persist-page-data-plugin',
  page: ({ payload }) => {
    const { properties } = payload
    const pageView = {
      path: properties.path,
      title: properties.title,
      url: properties.url
    }
    setViews(getViews().concat(pageView.path))
  },
}

const pagesViewedKey = 'PAGES_VIEWED'

// Use getViews elsewhere in app
function getViews() {
  return JSON.parse((localStorage.setItem(pagesViewedKey) || '[]'))
}

function setViews(data) {
  return localStorage.setItem(pagesViewedKey, JSON.stringify(data))
}

const analytics = Analytics({
  app: 'app-name',
  plugins: [
    persistPageViewsPlugin,
    // ... other plugins
  ]
})

/* Track initial page view */
analytics.page()

/* Track page views on SPA route changes */
onRouteChange((newPath) => {
  // trigger page view
  analytics.page()
})

export default analytics
```