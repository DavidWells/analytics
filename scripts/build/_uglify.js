const fs = require('fs')
const UglifyJS = require('uglify-js')

module.exports = function shrink(filePath, destination) {
  return new Promise(async (resolve, reject) => {
    const contents = await readFile(filePath)
    const result = UglifyJS.minify(contents)
    if (result.error) {
      return reject(result.error)
    }
    await writeFile(destination, result.code)
    return resolve(result.code)
  })
}

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (error, data) => {
      if (error) {
        return reject(error)
      }
      return resolve(data)
    })
  })
}

function writeFile(file, contents) {
  return new Promise(async (resolve, reject) => {
    fs.writeFile(file, contents, (error) => {
      if (error) {
        return reject(error)
      }
      return resolve()
    })
  })
}
