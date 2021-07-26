<!--
title: User activity util
pageTitle: User Activity Utils
description: Utility library for firing events on user idle & wakeup
-->

# Activity Utilities

User activity listener utilities in <!-- AUTO-GENERATED-CONTENT:START (pkgSize) -->`850 bytes`<!-- AUTO-GENERATED-CONTENT:END -->

[See live demo](https://utils-activity-listener.netlify.app).

```js
import { onIdle, onWakeup } from '@analytics/activity-utils'

const FIVE_MINUTES = 300e3

const opts = {
  timeout: FIVE_MINUTES,
}

onIdle((activeTime) => {
  console.log('Ive been idle for 5 minutes', activeTime)
}, opts)

onWakeup(() => {
  console.log('Yay wake up, user is back')
}, opts)
```

## Alternate libraries

- [user-idle-tracker](https://github.com/willianjusten/user-idle-tracker)