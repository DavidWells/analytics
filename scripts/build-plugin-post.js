// Verify that script works in SSR context
const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const dir = process.cwd()
const pkg = require(`${dir}/package.json`)

const thePath = path.join(dir, pkg.browser)
const runLib = require(thePath)

try {
  runLib()
} catch (e) {
  console.log(`${pkg.name} Failed SSR`)
  process.exit(1)
}
