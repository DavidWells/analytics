
/* custom logger plugin */
const customAnalyticsPlugin = {
  name: 'my-custom-whatever',
  track: ({ payload }) => {
    console.log(`Send event "${payload.event}"`)
    console.log('with payload', payload.properties)
  }
}

export default customAnalyticsPlugin
