const rimraf = require('rimraf')

module.exports = function clean(dir) {
  return new Promise((resolve, reject) => {
    rimraf(dir, function (error) {
      if (error) {
        return reject(error)
      }
      return resolve(true)
    })
  })
}
