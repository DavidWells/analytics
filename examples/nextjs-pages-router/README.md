# Next.js Pages Router analytics example

<!-- [Demo link](tbd?) -->

See `/lib/analytics.js` and `/pages/_app.js` for analytics setup.

Page views are tracked with `analytics.page` via `next/router` events.

Analytics methods like track can later be used in other components by using the `useAnalytics` hook. See `/pages/profile.js` for more information.

## CLI Commands

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:3000
npm run dev

# build for production with minification
npm run build

# test the production build locally
npm run start
```