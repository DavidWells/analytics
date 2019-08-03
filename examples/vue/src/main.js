import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import updatePageTags from './utils/updatePageTags'
import analytics from './analytics'
import routes from './routes'

Vue.config.productionTip = false

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history', routes
})

/* Update route title tags & page meta */
router.beforeEach(updatePageTags)

router.afterEach(( to, from ) => {
  console.log(`Route change to ${to.path} from ${from.path}`) // eslint-disable-line
  analytics.page()
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
