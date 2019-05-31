// const minimist = require('minimist')
// const argv = minimist(process.argv.slice(2))
const path = require('path')
const clean = require('./_clean')
const runRollup = require('./_run-rollup')
const uglify = require('./_uglify')
const dir = process.cwd()

process.env.NODE_ENV = 'production'

async function runBuild(dir) {
  try {
    const data = await runRollup(dir)
    const hasIife = data.find((output) => output.format === 'iife')

    if (hasIife) {
      const filePath = path.join(dir, hasIife.file)
      const destination = path.join(dir, hasIife.file.replace(/\.js/, '.min.js'))
      const fileName = path.basename(destination)

      // 🔥🔥🔥 hack to fix main analytics build. Remove in future
      if (fileName !== 'analytics.min.js') {
        console.log('Uglify file:', filePath)
        console.log('Uglify output:', destination)
        await uglify(filePath, destination)
      }
    }
    console.log(`Finished ${dir} build`)
    // console.log('hasIife', hasIife)
    // console.log('data', data)
  } catch (e) {
    console.log('Build error', e)
    process.exit(1)
  }
}

runBuild(dir)
