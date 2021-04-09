---
title: Typesafe Analytics
description: Improve our analytics code using Typescript
pageTitle: Typesafe Analytics
---

[Clean data](https://davidwells.io/blog/clean-analytics) is important! 

You can leverage typescript to ensure that events and payloads are correct.

## Patterns for Type Safety

See the [full source code](https://github.com/jherr/ts-analytics) for this video on github https://github.com/jherr/ts-analytics/tree/master/src.

<iframe width="560" height="315" src="https://www.youtube.com/embed/NJxagi7K-D8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

- [04:25​ Using function overloads](https://www.youtube.com/watch?v=NJxagi7K-D8&t=265s)
- [10:45​ Using function overloads with enums](https://www.youtube.com/watch?v=NJxagi7K-D8&t=645s)
- [13:52​ Using an event map](https://www.youtube.com/watch?v=NJxagi7K-D8&t=832s)

Jack is the man! Make sure to subscribe to his [youtube channel](https://www.youtube.com/channel/UC6vRUjYqDuoUsYsku86Lrsw)!

## Runtime validation

It's also possible to verify the analytics at runtime by adding a [custom plugin](https://getanalytics.io/plugins/writing-plugins/) or using something like the prebaked [event-validation plugin](https://getanalytics.io/plugins/event-validation/)

Here's an example of a custom plugin to verify events before tracking data is sent to providers.

```js
import Analytics from 'analytics'

function eventValidationPlugin(pluginConfig = {}) {
  return {
    name: 'my-custom-event-validation-plugins',
    trackStart: ({ payload, config, abort }) => {
      const { event, properties } = payload
      if (event !== 'foo') {
        throw new Error('Oh no this data is wrong. Please fix developer!')
      }
    }
  }
}

const analytics = Analytics({
  app: 'app-name',
  plugins: [
    // Add plugin before provider integrations
    eventValidationPlugin()
    // ... your analytics integrations like google analytics etc
  ]
})
```
