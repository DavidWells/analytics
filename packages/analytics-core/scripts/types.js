// https://github.com/englercj/tsd-jsdoc/issues/64#issuecomment-462020832
const fs = require('fs')
const path = require('path')
const indentString = require('indent-string')
const mkdirp = require('mkdirp')

const TYPES_PATH = path.resolve(__dirname, '../temp-types/types.d.ts')
const OUTPUT_PATH = path.resolve(__dirname, '../lib/types.d.ts')
const content = fs.readFileSync(TYPES_PATH, 'utf-8')

const typesFromJsDocs = content
  // Remove declares
  .replace(/^declare\s/gm, '')
  // Export analytics instance
  .replace(/type AnalyticsInstance =/gm, 'export type AnalyticsInstance =')
  // Make promises return void
  .replace(/\@returns \{Promise\}/gm, '@returns {Promise<void>}')
  .replace(/=> Promise;/gm, '=> Promise<any>;')
  // Fix plugin interface
  .replace(/plugins\?: object\[\]/gm, 'plugins?: Array<AnalyticsPlugin>')

// Expose main API
const newContent = `declare module "analytics" {
${indentString(typesFromJsDocs, 2)}
  export const CONSTANTS: constants;

  export const init: typeof analytics;

  export const Analytics: typeof analytics;

  export default analytics;
}`

mkdirp(path.dirname(OUTPUT_PATH), function (err) {
  if (err) console.error(err)
  fs.writeFileSync(OUTPUT_PATH, newContent)
})
