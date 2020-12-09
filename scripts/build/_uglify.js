const fs = require('fs')
const UglifyJS = require('uglify-js')

module.exports = function shrink(filePath, destination) {
  return new Promise(async (resolve, reject) => {
    const contents = await readFile(filePath)
    // Hack for Build error JS_Parse_Error [SyntaxError]: Unexpected token: keyword (const) in aws-point
    if (filePath.match(/@analytics\/aws-pinpoint\.js$/)) {
      return resolve()
    }
    const result = UglifyJS.minify(contents)
    if (result.error) {
      console.log('UglifyJS error', result.error)
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

// module.exports = function shrink(filePath, destination) {
//   console.log('SHRINK', filePath)
//   return new Promise((resolve, reject) => {
//     fs.readFile(filePath, 'utf8', (error, contents) => {
//       if (error) {
//         return reject(error)
//       }
//
//       console.log('contents', contents)
//
//       const result = UglifyJS.minify(contents)
//       if (result.error) {
//         return reject(result.error)
//       }
//
//       fs.writeFile(destination, result.code, (error) => {
//         if (error) {
//           return reject(error)
//         }
//         return resolve(result.code)
//       })
//     })
//   })
// }
