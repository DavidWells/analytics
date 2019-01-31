import config from './rollup.config'

export default config({
  output: {
    name: 'analyticsUtils',
    format: 'iife',
    file: 'dist/analytics-utils.js',
  },
  externals: [],
  browser: true
})
