const getPluginInfo = require('./parse')

function getPluginInfoSync() {
  return (filePath) => {
    return getPluginInfo(filePath)
  }
}

module.exports = getPluginInfoSync
