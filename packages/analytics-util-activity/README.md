<!--
title: User activity util
pageTitle: User Activity Utils
description: Utility library for firing events on user idle & wake up
-->

# Activity Utilities

User activity listener utility in <!-- AUTO-GENERATED-CONTENT:START (pkgSize:plural) -->`850 bytes`<!-- AUTO-GENERATED-CONTENT:END -->

[See live demo](https://utils-activity-listener.netlify.app).

```js
import { onIdle, onWakeUp } from '@analytics/activity-utils'

const FIVE_MINUTES = 300e3

const opts = {
  timeout: FIVE_MINUTES,
}

onIdle((activeTime) => {
  console.log('Ive been idle for 5 minutes', activeTime)
}, opts)

onWakeUp(() => {
  console.log('Yay wake up, user is back')
}, opts)
```

## Alternate libraries

- [user-idle-tracker](https://github.com/willianjusten/user-idle-tracker)