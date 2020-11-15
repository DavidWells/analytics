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
  // Export plugin config
  .replace(/type MixpanelPluginConfig =/gm, 'export interface MixpanelPluginConfig')
  // Remove dummy Mixpanel interfaces
  .replace(/type Mixpanel =.+;/gm, '')
  .replace(/type MixpanelConfig =.+;/gm, '')
  // Make Mixpanel config partial in places where it's assigned to something
  .replace(/(:\s*)MixpanelConfig/gm, (_, matchStart) => `${matchStart}Partial<MixpanelConfig>`)

// Expose main API
const newContent = `
import type { AnalyticsPlugin } from 'analytics';
import type { Mixpanel, Config as MixpanelConfig } from 'mixpanel-browser';

declare module "@analytics/mixpanel" {
${indentString(typesFromJsDocs, 2)}

  export default AnalyticsPlugin;
}`

mkdirp(path.dirname(OUTPUT_PATH), function (err) {
  if (err) console.error(err)
  fs.writeFileSync(OUTPUT_PATH, newContent)
})
