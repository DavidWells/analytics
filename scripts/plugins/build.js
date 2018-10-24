const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))
const buildPlugin = require('./do-rollup')
const postBuildCheck = require('./post-build')

const pluginNameSpace = argv.nameSpace
let stage = argv.env || 'production'
process.env.NODE_ENV = stage
let isProduction = process.env.NODE_ENV === 'production'

/*/* // uncomment to force non minified dev build or run `npm run build:dev`
isProduction = false
/**/

if (!pluginNameSpace) {
  console.log('Missing plugin namespace. --nameSpace xyzFolder')
  process.exit(1)
}

buildPlugin(pluginNameSpace, isProduction).then((data) => {
	console.log('DONE')
	setTimeout(function(){
		// postBuildCheck()
	}, 0)
	// run post check
}).catch((e) => {
	console.log('Rollup build error', e)
	process.exit(1)
})