const minimist = require('minimist')
const sane = require('sane')
const argv = minimist(process.argv.slice(2))
const buildPlugin = require('./do-rollup')

const pluginNameSpace = argv.nameSpace
const stage = argv.env || 'production'

if (!pluginNameSpace) {
  console.log('Missing plugin namespace. --nameSpace xyzFolder')
  process.exit(1)
}

const watcher = sane(process.cwd(), { glob: ['lib/**/*.js'] })

console.log(`Start ${pluginNameSpace} watcher`)

watcher.on('change', function (filepath, root, stat) {
  console.log('file changed', filepath)
  buildPlugin(pluginNameSpace, stage).then((data) => {
		console.log(`${pluginNameSpace} rebuilt`)
	}).catch((e) => {
		console.log('Rollup build error', e)
		process.exit(1)
	})
})