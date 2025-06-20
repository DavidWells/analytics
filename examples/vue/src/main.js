import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import updatePageTags from './utils/updatePageTags'
import analytics from './analytics'
import routes from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes
})

/* Update route title tags & page meta */
router.beforeEach(updatePageTags)

router.afterEach((to, from) => {
  console.log(`Route change to ${to.path} from ${from.path}`) // eslint-disable-line
  analytics.page()
})

const app = createApp(App)
app.use(router)
app.mount('#app')
