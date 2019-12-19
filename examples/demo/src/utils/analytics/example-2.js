import Analytics from 'analytics'
import goSquared from '@analytics/gosquared'
import googleAnalytics from '@analytics/google-analytics'
import exampleProviderPlugin from './plugins/provider-example'


/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'yolo',
  plugins: [
    {
      name: 'hahahaa',
      methods: {
        thingNo(one, two, three) {
          console.log('thing one')
        },
        xyz(one, two, three) {
          console.log('thing xyz')
        },
      },
      track: () => {
        console.log('hi')
      },
      rad: () => {
        console.log('RADDDD')
      },
    },
    {
      NAMESPACE: 'hello',
      track: () => {
        console.log('hi')
      },
      methods: {
        thing(one, two, three) {
          const additionalArg = arguments[arguments.length - 1]
          const { instance } = this
          console.log('this', this)
          console.log('additionalArg', additionalArg)
          console.log('one', one)
          console.log('two', two)
          console.log('three', three)
          console.log('instance', this.instance)
          console.log('state', additionalArg.getState())
          this.instance.dispatch('radStart')
        },
        otherThing: (one, ...args) => {
          const additionalArg = args[args.length - 1]
          console.log('additionalArg', additionalArg)
          console.log('otherThing', one)
          additionalArg.on('radStart', () => {
            console.log('Do the silly thing')
          })
        },
        hey: (one, ...args) => {
          const instance = args[args.length - 1]
          console.log('instance', instance)
          console.log('this', this)
        },
      },
    },
    exampleProviderPlugin({
      settingOne: 'xyz'
    }),
    googleAnalytics({
      trackingId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID,
    }),
    // goSquared({
    //   projectToken: 'GSN-722377-Y'
    // })
  ]
})

// analytics.storage.setItem('wer', "hi", 'cookie')

window.Analytics = analytics

/* export analytics for usage through the app */
export default analytics
