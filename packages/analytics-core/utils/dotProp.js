/* Trimmed down https://github.com/sindresorhus/dot-prop */

export default function get(obj, path) {
  const pathArr = getPathSegments(path)

  for (let i = 0; i < pathArr.length; i++) {
    if (!Object.prototype.propertyIsEnumerable.call(obj, pathArr[i])) {
      return
    }
    obj = obj[pathArr[i]]

    if (obj === undefined || obj === null) {
      if (i !== pathArr.length - 1) {
        return
      }
      break
    }
  }
  return obj
}

function getPathSegments(path) {
  const pathArr = path.split('.')
  const parts = []

  for (let i = 0; i < pathArr.length; i++) {
    let p = pathArr[i]

    while (p[p.length - 1] === '\\' && pathArr[i + 1] !== undefined) {
      p = p.slice(0, -1) + '.'
      p += pathArr[++i]
    }
    parts.push(p)
  }
  return parts
}
