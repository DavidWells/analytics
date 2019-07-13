# Analytics Do Not Track Plugin

> Disable analytics tracking for opted out visitors

This [analytics](https://www.npmjs.com/package/analytics) plugin will disable `page`, `track`, & `identify` calls for visitors using [Do Not Track](https://caniuse.com/#feat=do-not-track).

<!-- AUTO-GENERATED-CONTENT:START (TOC) -->
- [Usage](#usage)
- [Standalone usage](#standalone-usage)
<!-- AUTO-GENERATED-CONTENT:END -->

## Usage

Usage with the [analytics](https://www.npmjs.com/package/analytics) library.

**Install**

```bash
npm install analytics analytics-plugin-do-not-track
```

**Usage**

```js
import Analytics from 'analytics'
import doNotTrack from 'analytics-plugin-do-not-track'

const analytics = Analytics({
  app: 'my-app',
  plugins: [
    doNotTrack(),
  ]
})

/* if visitor has "do not track" set in browser all tracking will noOp */

// does nothing if DNT on
analytics.page()

// does nothing if DNT on
analytics.track('buttonClick')

// does nothing if DNT on
analytics.identify('bob-lazar')
```

## Standalone usage

A function `doNotTrackEnabled` is exposed for usage without the `analytics` library.

**Install**

```bash
npm install analytics-plugin-do-not-track
```

**Example**

```js
import { doNotTrackEnabled } from 'analytics-plugin-do-not-track'

const isDNT = doNotTrackEnabled()
if (!isDNT) {
  // run tracking stuff
}
```
