const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const sane = require('sane')
const buildPlugin = require('./rollup')
const checkSsr = require('./check-ssr')
const pluginNameSpace = argv.nameSpace


process.env.NODE_ENV = argv.env || 'production'
let isProduction = process.env.NODE_ENV === 'production'

//*/* // uncomment to force non minified dev build or run `npm run build:dev`
isProduction = false
/**/

if (!pluginNameSpace) {
  console.log('Missing plugin namespace. --nameSpace xyzFolder')
  process.exit(1)
}

const cwd = process.cwd()
const watcher = sane(process.cwd(), { glob: ['lib/**/*.js'] })
console.log(`Start ${pluginNameSpace} watcher`)

watcher.on('change', function (filepath, root, stat) {
  console.log('file changed', path.join(cwd, filepath))
  buildPlugin(pluginNameSpace, isProduction).then((data) => {
		console.log(`${pluginNameSpace} rebuilt`)
		setTimeout(() => {
			checkSsr()
		}, 0);
	}).catch((e) => {
		console.log('Rollup build error', e)
		process.exit(1)
	})
})