# Next.js app router analytics example

<!-- [Demo link](tbd?) -->

See `/src/app/analytics.tsx` and `/src/app/layout.tsx` for analytics setup.

Page views are tracked with `analytics.page` via `next-router`.

Analytics methods like track can later be used in other components by using the `useAnalytics` hook. See `/src/app/profile/page.tsx` for more information.

## CLI Commands

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# test the production build locally
npm run start
```