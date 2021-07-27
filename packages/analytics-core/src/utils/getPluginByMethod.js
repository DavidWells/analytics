/**
 * Return analytic integrations with matching methods
 * @param  {array} plugins - array of currently loaded plugins
 * @param  {string} method - key of the method name. IE 'track', 'identify' etc
 * @return {array} returns array of integrations with matching method
 */
export default function getPluginByMethod(method, plugins) {
  return Object.keys(plugins).reduce((arr, name) => {
    const int = plugins[name]
    return (int[method]) ? arr.concat(int) : arr
  }, [])
}