const argv = require('minimist')(process.argv.slice(2))
const path = require('path')
const globby = require('markdown-magic').globby
const doBuild = require('./do-build')
const checkSsr = require('../plugins/check-ssr')

let stage = argv.env || 'production'
process.env.NODE_ENV = argv.env || 'production'
let isProduction = process.env.NODE_ENV === 'production'

/*/* // uncomment to force non minified dev build or run `npm run build:dev`
isProduction = false
/**/

doBuild(isProduction).then(() => {
	console.log('fin')
	setTimeout(() => {
		checkSsr(true)
	}, 0);
})

