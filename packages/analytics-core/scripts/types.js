// https://github.com/englercj/tsd-jsdoc/issues/64#issuecomment-462020832
const fs = require('fs')
const path = require('path')
const indentString = require('indent-string')
const mkdirp = require('mkdirp')

const TYPES_PATH = path.resolve(__dirname, '../temp-types/types.d.ts')
const OUTPUT_PATH = path.resolve(__dirname, '../lib/types.d.ts')
const content = fs.readFileSync(TYPES_PATH, 'utf-8')

// const PAGE_REGEX = /type PageData = {(?:.*?|\n)*?}/gm
// const PLUGIN_REGEX = /type AnalyticsPlugin = {(?:.*?|\n)*?}/gm

const typesFromJsDocs = content
  // Remove declares
  .replace(/^declare\s/gm, '')
  // Export user-facing types (and where possible, convert objects to interface so they can be extended) 
  // via https://github.com/DavidWells/analytics/blob/2712604ff90ffd0baf4ab62c7f12267b07b0d823/packages/analytics-core/scripts/types.js#L15
  .replace(/type AnalyticsInstance =/gm, 'export interface AnalyticsInstance ')
  .replace(/type AnalyticsInstanceConfig =/gm, 'export interface AnalyticsInstanceConfig ')
  .replace(/type (\w+)Payload =/gm, match => `export ${match}`)
  // Exported so user doesn't have to do ReturnType to get them
  .replace(/type DetachListeners =/gm, 'export type DetachListeners =')

  // Convert following types to generics to be able to pass payload type throught them
  // Export hooks and convert them to generics accepting payload type
  .replace(
    /type (\w+)Hook =(.*)Context/gm,
    (_, typeName, argsDefStart) => `export type ${typeName}Hook<T = ${typeName}Payload> =${argsDefStart}Context<T>`,
  )
  // Convert contexts to generics accepting payload type
  .replace(
    /type (\w+)Context =(.*)ContextProps(\W)/gm,
    (_, typeName, typeDefStart, typeDefEnd) => `type ${typeName}Context<T = ${typeName}Payload> =${typeDefStart}ContextProps<T>${typeDefEnd}`,
  )
  // Convert context props types to generics accepting payload type
  .replace(
    /type (\w+)ContextProps =((.|\s)*?)payload: \w+/gm,
    (_, typeName, typeDefStart) => `type ${typeName}ContextProps<T = ${typeName}Payload> =${typeDefStart}payload: T`,
  )

  // Rename following types so we can set generics in their place
  .replace(/type AnalyticsPlugin = /gm, 'interface AnalyticsPluginBase ')
  .replace(/type PageData = /gm, 'interface PageDataBase ')
  // Make promises return void
  .replace(/\@returns \{Promise\}/gm, '@returns {Promise<void>}')
  .replace(/=> Promise;/gm, '=> Promise<any>;')
  // Convert unions ('|') to joins ('&').
  // Joins are used for modular JSDOC typedefs that support intellisense in VS Code.
  // 'jsdoc' cannot parse joins, so they are temporarily transpiled to unions by 'jsdoc-plugin-intersection'.
  .replace(/ \| /gm, ' & ')

  // Make types extensible
const typeExtensions = `
  export type PageData<T extends string = string> = PageDataBase & Record<T, unknown>;
  export type AnalyticsPlugin<T extends string = string> = AnalyticsPluginBase & string extends T
    ? Record<string, unknown>
    : Record<T, unknown> & Record<string, unknown>;
`;

// Expose main API
const newContent = `declare module "analytics" {
${indentString(typesFromJsDocs, 2)}
${typeExtensions}

  export const CONSTANTS: constants;

  export const init: typeof analytics;

  export const Analytics: typeof analytics;

  export default analytics;
}`

// Fix interface semi colons (╯°□°)╯︵ ┻━┻
const finalContent = newContent.replace(/interface (\w+)(\s+){([?\w\s\d:;()\[\]=>\.]*)};/gm, 'interface $1$2{$3}')

mkdirp(path.dirname(OUTPUT_PATH), function (err) {
  if (err) console.error(err)
  fs.writeFileSync(OUTPUT_PATH, finalContent)
})
