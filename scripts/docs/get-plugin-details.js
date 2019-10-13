const path = require('path')
const parseSourceCode = require('./parse').sync

module.exports = function grabPluginData(originalPath) {
  const dir = path.dirname(originalPath)
  // const SRC_DIR = path.resolve(dir, 'src')
  const PKG_DIR = path.join(dir, 'package.json')
  const pkg = require(PKG_DIR)
  if (!pkg || !pkg.projectMeta || !pkg.projectMeta.platforms) {
    return []
  }

  return Object.keys(pkg.projectMeta.platforms).map((platform) => {
    const entryPath = pkg.projectMeta.platforms[platform]
    const resolvedEntryPath = path.resolve(dir, entryPath)
    return {
      path: resolvedEntryPath,
      dir: dir,
      platform: platform,
      data: parseSourceCode(resolvedEntryPath),
      pkg: pkg
    }
  })
}
