
export default function crazyEgg(pluginConfig) {
  return {
    NAMESPACE: 'crazy-egg',
    initialize: ({ config }) => {
      console.log('Crazy egg has no server implementation')
    }
  }
}
