const path = require('path')

module.exports = function checkSSR(endProcess) {
  const dir = process.cwd()
  const pkg = require(`${dir}/package.json`)

  try {
    const commonJsPath = path.join(dir, pkg.main)
    console.log(`requiring module ${commonJsPath}`)
    const testSSR = require(commonJsPath)
    console.log('testSSR', testSSR)
  } catch (e) {
    console.log('Error in module')
    console.log(e)
    console.log(`${pkg.name} Failed Serverside rendering`)
    if (endProcess) {
      process.exit(1)
    }
  }
}
