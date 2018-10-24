const minimist = require('minimist')
const sane = require('sane')
const argv = minimist(process.argv.slice(2))
const doBuild = require('./do-build')
const checkSsr = require('./check')

const stage = argv.env || 'production'
process.env.NODE_ENV = stage
let isProduction = process.env.NODE_ENV === 'production'

/*/* // uncomment to force non minified dev build or run `npm run build:dev`
isProduction = false
/**/

const cwd = process.cwd()
const watcher = sane(process.cwd(), { glob: ['lib/**/*.js'] })

watcher.on('change', function (filepath, root, stat) {
  console.log('file changed', filepath)
  // Todo make watcher smarter about while files to rebuild
  doBuild(isProduction).then(() => {
		setTimeout(() => {
			checkSsr()
		}, 0);
	}).catch((e) => {
		console.log('Rollup build error', e)
		process.exit(1)
	})
})