import Analytics from '../../src'

export default function generateInstance(plugins) {
  return Analytics({
    app: 'appname',
    version: 100,
    plugins: plugins
  })
}
