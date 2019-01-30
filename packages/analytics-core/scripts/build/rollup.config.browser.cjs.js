import config from './rollup.config'

export default config({
  output: {
    format: 'cjs',
    file: 'lib/analytics.browser.cjs.js',
  },
  browser: true
})
