# Vue 3 with `analytics` example

How to use `analytics` with `Vue 3` & `Vue Router 4`.

See `./src/main.js` & `./src/analytics.js` for example code.

Page views are fired from router `afterEach` events.

```js
router.afterEach((to, from) => {
  analytics.page()
})
```

## Modern Stack

This example uses:
- **Vue 3** - Latest version of Vue.js with Composition API support
- **Vue Router 4** - Modern routing for Vue 3
- **Vite** - Fast build tool and dev server
- **Analytics** - Updated to latest version

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run build
```

### Preview production build
```
npm run preview  
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Vite Configuration Reference](https://vitejs.dev/config/).
