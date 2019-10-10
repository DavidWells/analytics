const parse = require('./parse')
const forceSync = require('sync-rpc')

module.exports = parse

// Force sync processing until markdown-magic 2.0 is released
module.exports.sync = forceSync(require.resolve('./parseSync'))
