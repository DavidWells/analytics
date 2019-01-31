import config from './rollup.config'

export default config({
  output: {
    format: 'esm',
    file: 'lib/analytics-utils.es.js',
  },
  browser: false
})
