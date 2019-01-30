import config from './rollup.config'

export default config({
  output: {
    format: 'esm',
    file: 'lib/analytics.browser.es.js',
  },
  browser: true
})
