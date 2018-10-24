const path = require('path')
const globby = require('markdown-magic').globby
const buildUtils = require('./rollup')

module.exports = function doBuild(isProduction) {
	const match = `${process.cwd()}/lib/**.js`
	return globby([match]).then((files) => {
		const promises = files.map((f) => {
			const name = path.basename(f)
			return buildUtils(name, isProduction).then((data) => {
				console.log(`${f} built`)
				// run post check
			})
		})

		return Promise.all(promises)
	})
}