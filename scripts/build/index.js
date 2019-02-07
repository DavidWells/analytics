// const minimist = require('minimist')
// const argv = minimist(process.argv.slice(2))
const path = require('path')
const clean = require('./_clean')
const runRollup = require('./_run-rollup')
const uglify = require('./_uglify')
const dir = process.cwd()

async function runBuild(dir) {
  try {
    const data = await runRollup(dir)
    const hasIife = data.find((output) => output.format === 'iife')

    if (hasIife) {
      const filePath = path.join(dir, hasIife.file)
      const destination = path.join(dir, hasIife.file.replace(/\.js/, '.min.js'))
      console.log('read', filePath)
      console.log('write', destination)
      // need to wait a sec for other build to finish
      const fileName = path.basename(destination)

      // 🔥🔥🔥 hack to fix main analytics build. Remove in future
      if (fileName !== 'analytics.min.js') {
        await uglify(filePath, destination)
      }
    }

    console.log('hasIife', hasIife)
    console.log('data', data)
  } catch (e) {
    console.log('Build error', e)
    process.exit(1)
  }
}

runBuild(dir)
