const generateConfig = require('./_config-rollup')
const { rollup } = require('rollup')

module.exports = function runRollup(directory) {
  const configs = generateConfig(directory)

  const builds = configs.map((conf) => {
    return rollup(conf).then(async (result) => {
      const data = {
        file: conf.output.file,
        format: conf.output.format,
        // interop: false,
        name: conf.output.name,
        // sourcemap: false,
      }
      // Exend for global libs https://rollupjs.org/guide/en#javascript-api
      if (conf.output.extend) {
        data.extend = true
      }
      await result.write(data)
      console.log(`End ${conf.output.format} build ${conf.output.file}`)
      return data
    })
  })

  return Promise.all(builds)
}
