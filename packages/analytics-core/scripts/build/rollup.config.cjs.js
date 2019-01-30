import config from './rollup.config'

export default config({
  output: {
    format: 'cjs',
    file: 'lib/analytics.cjs.js',
  },
  browser: false
})
