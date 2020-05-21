// https://github.com/englercj/tsd-jsdoc/issues/64#issuecomment-462020832
const fs = require('fs')
const path = require('path')
const indentString = require('indent-string')

const TYPES_PATH = path.resolve(__dirname, '../temp-types/types.d.ts')
const OUTPUT_PATH = path.resolve(__dirname, '../lib/types.d.ts')
const content = fs.readFileSync(TYPES_PATH, 'utf-8')

const typesFromJsDocs = content
  // Remove declares
  .replace(/^declare\s/gm, '')
  // Make promises return void
  .replace(/\@returns \{Promise\}/gm, '@returns {Promise<void>}')
  // Fix plugin interface
  .replace(/plugins\?: object\[\]/gm, 'plugins?: Array<AnalyticsPlugin>')

// Expose main API
const newContent = `declare module "analytics" {
${indentString(typesFromJsDocs, 2)}
  export const CONSTANTS: constants;

  export const init: typeof analytics;

  export const Analytics: typeof analytics;

  export = analytics;
}`

// Write out to types.d.ts file in /lib
fs.writeFileSync(OUTPUT_PATH, newContent)
