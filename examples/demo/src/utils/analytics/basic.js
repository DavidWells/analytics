import Analytics from 'analytics'

/* initialize analytics and load plugins */
const analytics = Analytics({
  debug: true,
  app: 'yolo',
  plugins: [
    {
      name: 'plugin-1',
      page: ({ payload }) => console.log('page view 1', payload)
    },
    {
      name: 'plugin-2',
      page: ({ payload }) => console.log('page view 2', payload)
    },
  ]
})

export default analytics
