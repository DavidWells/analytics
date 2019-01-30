import config from './rollup.config'

export default config({
  output: {
    name: 'window',
    extend: true,
    format: 'iife',
    file: 'dist/analytics.js',
  },
  externals: [],
  browser: true
})
