import config from './rollup.config'

export default config({
  output: {
    format: 'esm',
    file: 'lib/analytics-utils.browser.es.js',
  },
  browser: true
})
