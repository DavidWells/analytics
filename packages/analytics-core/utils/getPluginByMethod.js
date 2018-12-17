/**
 * Return analytic integrations with matching methods
 * @param  {array} integrations - array of currently loaded integrations
 * @param  {string} method - key of the method name. IE 'track', 'identify' etc
 * @return {array} returns array of integrations with matching method
 */
export default function getPluginByMethod(method, integrations) {
  return Object.keys(integrations).reduce((arr, plugin) => {
    const int = integrations[plugin]
    // console.log('int', int)
    return (int[method]) ? arr.concat(int) : arr
  }, [])
}
