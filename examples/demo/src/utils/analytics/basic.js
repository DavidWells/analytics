import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const customGA = googleAnalytics({
  trackingId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID,
  enabled: true
})

function delay(ms) { return new Promise(res => setTimeout(res, ms)) }

let run = false
/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'yolo',
  version: '1.2.0',
  settings: {
    useParams: true,
  },
  initialUser: {
    // anonymousId: 'd62959d3-b50f-4041-8499-a943c9af25b3',
    // userId: '12828281811818',
    traits: {
      blue: 'shirts'
    },
  },
  resolvers: {
    getUserId: async () => {
      await delay(2000)
      return 'foo'
    }
  },
  plugins: [
    {
      ...customGA,
    },
    {
      name: 'plugin-x',
      // setItemStart: ({ payload }) => {
      //   console.log('setItemStartpayload', payload)
      //   if (payload.key === '__anon_id') {
      //     run = true
      //     return {
      //       ...payload,
      //       ...{
      //         value: 'lol'
      //       }
      //     }
      //   }
      // },
      bootstrap: async ({ instance }) => {
        await delay(1000)
        console.log('Bootstrap plugin x')
        // d62959d3-b50f-4041-8499-a943c9af25b3
        // instance.setAnonymousId('xxxxxxx-b50f-4041-8499-a943c9af25b3')
        // instance.setAnonymousId('1234567')
      },
      initialize: () => {
        console.log('FIRE INIT FROM PLUGIN X')
      },
      page: ({ payload }) => console.log('plugin-x page view', payload),
    },
    {
      name: 'plugin-y',
      bootstrap: () => {
        console.log('Bootstrap plugin y')
      },
      enabled: false,
      page: ({ payload }) => console.log('plugin-y page view', payload),
    },
    {
      name: 'plugin-1',
      bootstrap: async () => {
        // await delay(300)
        console.log('Bootstrap plugin 1')
      },
      initialize: () => {
        console.log('1')
      },
      page: ({ payload }) => console.log('plugin-1 page view', payload),
    },
    {
      name: 'plugin-2',
      initialize: () => {
        console.log('2')
      },
      page: ({ payload }) => console.log('plugin-2 page view', payload),
      loaded: () => {
        return !!window.LOLOLOLOL
      }
    },
  ]
})

setTimeout(function() {
 window.LOLOLOLOL = 'goooooooo'
}, 3000);

export default analytics
