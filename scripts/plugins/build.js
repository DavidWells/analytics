const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))
const buildPlugin = require('./rollup')
const checkSsr = require('./check-ssr')

const pluginNameSpace = argv.nameSpace
process.env.NODE_ENV = argv.env || 'production'
let isProduction = process.env.NODE_ENV === 'production'

/* /* // uncomment to force non minified dev build or run `npm run build:dev`
isProduction = false
/**/

if (!pluginNameSpace) {
  console.log('Missing plugin namespace. --nameSpace xyzFolder')
  process.exit(1)
}

buildPlugin(pluginNameSpace, isProduction).then((data) => {
  console.log(`${pluginNameSpace} finished building`)
  // Check SSR
  setTimeout(function() {
    // checkSsr(true)
  }, 0)
}).catch((e) => {
  console.log('Rollup build error', e)
  process.exit(1)
})
