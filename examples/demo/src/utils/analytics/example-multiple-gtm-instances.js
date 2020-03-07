import Analytics from 'analytics'
import googleTagManager from '@analytics/google-tag-manager'

const GTMOne = googleTagManager({ containerId: 'GTM-123xyz' })
// For instance 2, override the plugin 'name' and provide the 2nd GTM container ID
const GTMTwo = Object.assign({}, googleTagManager({ containerId: 'GTM-456abc'}), {
  name: 'google-tag-manager-two'
})

/* initialize analytics and load plugins */
const analytics = Analytics({
  app: 'awesome-app',
  debug: true,
  plugins: [
    GTMOne,
    GTMTwo
  ]
})

/* export analytics for usage through the app */
export default analytics
