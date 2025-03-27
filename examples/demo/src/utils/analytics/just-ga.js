import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const validationPlugin = {
  NAMESPACE: 'id-plugin-start',
  identifyStart: ({ payload, abort }) => {
    return abort('Identify traits is the same as previous identify');
  }
}

const abortQueueTests = [
  validationPlugin,
  {
    NAMESPACE: 'page-plugin-start',
    pageStart: ({ abort }) => {
      return abort('stop all other page calls')
    },
  },
  {
    NAMESPACE: 'page-plugin',
    page: ({ payload, abort }) => {
      console.log('abort', abort)
      console.log('Run page')
    }
  }
]

const GaPlugin = [
  googleAnalytics({
    measurementIds: ['G-RL2P3ZC6B2'],
    // gtagConfig: {
    //   send_page_view: true,
    // }
    // debug: true
  }),
]

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'yolo',
  version: '1.2.0',
  plugins: GaPlugin
})

export default analytics
