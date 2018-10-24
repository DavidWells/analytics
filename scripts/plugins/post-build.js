const path = require('path')

module.exports = function postBuild() {
	console.log('run post build')
	const dir = process.cwd()
	const pkg = require(`${dir}/package.json`)

	const thePath = path.join(dir, pkg.main)
	console.log('thePath', thePath)
	const runLib = require(thePath)

	try {
	  console.log(runLib)
	} catch (e) {
		console.log(e)
	  console.log(`${pkg.name} Failed SSR`)
	  process.exit(1)
	}
}