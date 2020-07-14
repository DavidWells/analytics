import Analytics from 'analytics'

const timeout = ms => new Promise(res => setTimeout(res, ms))

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'yolo',
  plugins: [
    {
      name: 'plugin-1',
      page: ({ payload }) => console.log('page view 1', payload),
      /* Functions to expose to analytics instance */
      methods: {
        thing(one, two, three) {
          console.log('hi from thing')
          console.log('this.instance', this.instance)
        },
        enable: () => {},
        otherThing: (one, ...args) => {
          console.log('hi from other thing')
          // Arrow functions break this.x context. The instance is instead injected as last arg
          const instance = args[args.length - 1]
          console.log('instance', instance)
        },
        async lol(one, two, three) {
          console.log('hi from lol')
          console.log('one, two, three', one, two, three)
          console.log('this.instance', this.instance)
          await timeout(3000)
          // do custom whatever
          // this.instance is the instance of analytics
          return Promise.resolve('wooo')
        },
        asyncFunc: async (one, two, three) => {
          console.log('hi from lol')
          console.log('one, two, three', one, two, three)
          await timeout(3000)
          console.log('go go go')
          // do custom whatever
          // this.instance is the instance of analytics
          return Promise.resolve('wooo')
        },
      }
    },
    {
      name: 'plugin-2',
      page: ({ payload }) => console.log('page view 2', payload),
      methods: {
        x(one, two, three) {
          console.log('hi from thing 2')
          // do custom whatever
          // this.instance is the instance of analytics
          const state = this.instance.getState()
        },
        y: (one, ...args) => {
          console.log('hi from other thing 2')
          // Arrow functions break this.x context. The instance is instead injected as last arg
          const instance = args[args.length - 1]
          instance.track('myCustomThing', instance)
        },
        nice(one, two, three) {
          console.log('hi from lol 2')
          // do custom whatever
          // this.instance is the instance of analytics
          return Promise.resolve('wooo')
        },
      }
    },
  ]
})

export default analytics
