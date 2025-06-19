# Next.js Pages Router Analytics Example

This demo shows how to integrate analytics with Next.js using the Pages Router.

See `/pages/_app.js` for analytics setup and automatic page tracking.

Page views are tracked automatically via the Next.js router events.

Analytics methods like track can be used in any component by using the `useAnalytics` hook. See `/pages/profile.js` for more information.

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