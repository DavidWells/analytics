const fs = require('fs')
const path = require('path')
// Copy types from analytics core
const SRC = path.resolve(__dirname, '../../analytics-core/dist/types.d.ts')
const DEST = path.resolve(__dirname, '../lib/types.d.ts')

// Check if source file exists before copying
if (fs.existsSync(SRC)) {
  fs.copyFile(SRC, DEST, (err) => {
    if (err) throw err
    console.log(`Types synced to ${DEST}`)
  })
} else {
  console.log(`Source types file ${SRC} does not exist yet, skipping sync`)
}
