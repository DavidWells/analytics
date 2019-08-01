const path = require('path')
const fs = require('fs')
const globby = require('markdown-magic').globby
const cp = require("child_process")

function installDeps(functionDir, cb) {
  cp.exec("npm i", { cwd: functionDir }, cb)
}

(async () => {
  console.log('Installing example deps. This can take some time')
  console.log('Alternatively, you can cd into your example of choice and run "npm install"')
  console.log()
  const findJSFiles = ['*/package.json', '!node_modules', '!**/node_modules']
  const directory = path.join(__dirname, '..', 'examples')
	const foldersWithDeps = await globby(findJSFiles, { cwd: directory })

  const folders = foldersWithDeps.map(fnFolder => {
    return fnFolder.substring(0, fnFolder.indexOf("package.json"))
  }).map((folder) => {
    console.log(`Installing ${folder} deps`)
    installDeps(path.join(__dirname, '..', 'examples', folder), () => {
      console.log(`${folder} dependencies installed`)
    })
  })

})()
