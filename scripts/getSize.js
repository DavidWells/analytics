const path = require('path')
const chalk = require('chalk')
const gzipSize = require('gzip-size')
const brotliSize = require('brotli-size')
const prettyBytes = require('pretty-bytes')

function formatSize(size, filename, type, raw) {
  const pretty = raw ? `${size}B` : prettyBytes(size)
  const color = size < 5000 ? 'green' : size > 40000 ? 'red' : 'yellow'
  const MAGIC_INDENTATION = type === 'br' ? 13 : 10
  const prefix = ' '.repeat(MAGIC_INDENTATION - pretty.length)
  return `${prefix}${chalk[color](pretty)}: ${chalk.white(path.basename(filename))}.${type}`
}

function pretty(size, raw) {
  return raw ? `${size}kb` : prettyBytes(size)
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const type = sizes[i]
  const space = type === 'bytes' ? ' ' : ''
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + space + type;
}

async function getSizeInfo(code, filename) {
  const raw = code.length < 5000
  const gzip = await gzipSize(code)
  const brotli = await brotliSize(code)
  const gzipLog = formatSize(gzip, filename, 'gz', raw)
  const brotliLog = formatSize(brotli, filename, 'br', raw)
  return {
    size: formatBytes(gzip),
    gzip: pretty(gzip, raw),
    brotli: pretty(brotli, raw),
    gzipLog,
    brotliLog
  }
}

module.exports = {
  getSizeInfo
}
