const path = require('path')
const sane = require('sane')
const runRollup = require('./_run-rollup')
const checkSsr = require('./_checkSSR')

const dir = process.cwd()
const watcher = sane(dir, { glob: ['src/**/*.js'], watchman: true })
console.log(`Start ${dir} watcher`)

watcher.on('ready', function () { console.log('ready') })

watcher.on('change', async function (filepath, root, stat) {
  console.log('file changed', path.join(dir, filepath))
  try {
    const data = await runRollup(dir)
    // setTimeout(function() {
    //   checkSsr(true)
    // }, 100)
  } catch (error) {
    console.log('Rollup build error', error)
    process.exit(1)
  }
})
