# vue with `analytics` example

How to use `analytics` with `vue` & `vue-router`.

See `./src/main.js` & `./src/analytics.js` for example code.

Page views are fired from router `afterEach` events.

```js
router.afterEach(( to, from ) => {
  analytics.page()
})
```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
