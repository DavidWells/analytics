const fs = require('fs')
const path = require('path')
// https://github.com/englercj/tsd-jsdoc/issues/64#issuecomment-462020832

const TYPES_PATH = path.resolve(__dirname, '../temp-types/types.d.ts')
// analytics.cjs.d.ts
const OUTPUT_PATH = path.resolve(__dirname, '../lib/types.d.ts')
const content = fs.readFileSync(TYPES_PATH, 'utf-8')

// Export not needed
const exportDeclaration = content.replace(/^(declare function analytics)/gm, 'export function analytics')

// Expose main API
const newContent = `${content}
export const CONSTANTS: constants;

export const init = analytics;

export const Analytics = analytics;

export = analytics;`
fs.writeFileSync(OUTPUT_PATH, newContent)
