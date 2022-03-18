const path = require('path')
const getPluginInfo = require('./parse')

module.exports = async function grabPluginData(originalPath) {
  const dir = path.dirname(originalPath)
  // const SRC_DIR = path.resolve(dir, 'src')
  const PKG_DIR = path.join(dir, 'package.json')
  const pkg = require(PKG_DIR)
  if (!pkg || !pkg.projectMeta || !pkg.projectMeta.platforms) {
    return []
  }
  const platforms = Object.keys(pkg.projectMeta.platforms)
  const infos = await Promise.all(
    platforms.filter((platform) =>{
      return pkg.projectMeta.platforms[platform]
    }).map((platform) => {
      const entryPath = pkg.projectMeta.platforms[platform]
      const resolvedEntryPath = path.resolve(dir, entryPath)
      return getPluginInfo(resolvedEntryPath, platform)
    })
  )

  return platforms.map((platform, i) => {
    const entryPath = pkg.projectMeta.platforms[platform]
    const resolvedEntryPath = path.resolve(dir, entryPath)
    return {
      path: resolvedEntryPath,
      dir: dir,
      platform: platform,
      data: infos[i],
      pkg: pkg
    }
  })
}
