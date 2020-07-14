const fs = require('fs')
const path = require('path')
// Copy types from analytics core
const SRC = path.resolve(__dirname, '../../analytics-core/lib/types.d.ts')
const DEST = path.resolve(__dirname, '../lib/types.d.ts')

fs.copyFile(SRC, DEST, (err) => {
  if (err) throw err;
  console.log(`Types synced to ${DEST}`)
})
