const path = require('path')
const babel = require('rollup-plugin-babel')
const minify = require('rollup-plugin-babel-minify')
const replace = require('rollup-plugin-replace')
const nodeResolve = require('rollup-plugin-node-resolve')
const removeNodeBuiltIns = require('rollup-plugin-node-builtins')
const stripBanner = require('rollup-plugin-strip-banner')
const compiler = require('@ampproject/rollup-plugin-closure-compiler')
const commonjs = require('rollup-plugin-commonjs')
const { sizeSnapshot } = require('rollup-plugin-size-snapshot')
const { uglify } = require('rollup-plugin-uglify')
const { terser } = require('rollup-plugin-terser')
const json = require('rollup-plugin-json')

process.env.NODE_ENV = 'production'
let isProduction = process.env.NODE_ENV === 'production' && !process.env.ROLLUP_WATCH
let doMinify = false

module.exports = function generateConfig(directory) {
  const pkg = require(`${directory}/package.json`)
  const externals = (pkg.dependencies) ? Object.keys(pkg.dependencies) : []
  const inputPath = path.join(`${directory}/src`, 'index.js')
  const rollupConfigs = getFormats(pkg)

  return rollupConfigs.map((config) => {
    const { format, file } = config.output
    console.log()
    console.log('-----------------------------')
    console.log(`Building ${format} to ${file}`)
    const isESModule = (config.output.format === 'esm')
    const isIIFE = (config.output.format === 'iife')

    let externs = config.externals || externals

    if (isIIFE && pkg.name.match(/-util-/)) {
      console.log(`NO EXTERNS FOR ${pkg.name} dist build`)
      // externs = []
    }

    return {
      input: inputPath,
      cache: false,
      external: externs,
      output: config.output,
      plugins: [
        stripBanner({
          exclude: 'node_modules/**/*',
        }),
        nodeResolve({
          jsnext: true
        }),
        babel({
          exclude: 'node_modules/**',
          runtimeHelpers: true
        }),
        {
          transform(source) {
            return source.replace(/['"]use strict['"']/g, '')
          },
        },
        removeNodeBuiltIns(),
        replace({
          'process.browser': JSON.stringify(!!config.browser),
          'process.env.NODE_ENV': isProduction ? "'production'" : "'development'",
          'process.env.VERSION': JSON.stringify(pkg.version)
        }),
        commonjs({
          include: 'node_modules/**',
          // ignore: [ 'conditional-runtime-dependency' ]
        }),
        ...[
          !isIIFE && json({
            // All JSON files will be parsed by default,
            // but you can also specifically include/exclude files
            include: 'node_modules/**',

            // for tree-shaking, properties will be declared as
            // variables, using either `var` or `const`
            preferConst: true, // Default: false

            // specify indentation for the generated default export —
            // defaults to '\t'
            indent: '  ',

            // ignores indent and generates the smallest code
            compact: true, // Default: false

            // generate a named export for every property of the JSON object
            namedExports: true // Default: true
          })
        ],
        ...[
          doMinify && isProduction && !isESModule && compiler({
            compilationLevel: 'SIMPLE',
            languageIn: 'ECMASCRIPT5_STRICT',
            languageOut: (isIIFE) ? 'ECMASCRIPT5' : 'ECMASCRIPT5_STRICT',
            env: (isIIFE) ? 'BROWSER' : 'CUSTOM',
            warningLevel: 'QUIET',
            applyInputSourceMaps: false,
            useTypesForOptimization: false,
            processCommonJsModules: false,
          }),
          // Try all the shrinkers
          doMinify && isProduction && !isESModule && !isIIFE && terser(),
          doMinify && isProduction && !isESModule && !isIIFE && minify(),
          doMinify && isProduction && !isESModule && !isIIFE && uglify({
            compress: {
              // screw_ie8: true,
              warnings: false
            },
            output: {
              comments: false
            },
            sourcemap: false
          }),
          sizeSnapshot(),
        ],
      ]
    }
  })
}

/*
Build these formats
  "main": "lib/NAME.cjs.js",
  "jsnext:main": "lib/NAME.es.js",
  "module": "lib/NAME.es.js",
  "browser": {
    "./lib/NAME.cjs.js": "./lib/NAME.browser.cjs.js",
    "./lib/NAME.es.js": "./lib/NAME.browser.es.js"
  },
  "globalName": {
    "name": "window" // extend window
    "extends": true
  },
  "globalName": {
    "name": "_analytics" <-- name of global
  },
*/

function getGlobalName(pkg) {
  if (pkg.projectMeta && pkg.projectMeta.windowGlobal) {
    return pkg.projectMeta.windowGlobal
  }
  if (typeof pkg.globalName === 'object') {
    return pkg.globalName.name
  }
  return pkg.globalName
}

function getFormats(pkg) {
  const { name, globalName, browser, module: moduleName, main } = pkg

  const iifeName = getGlobalName(pkg)
  const iifeSettings = {
    name: iifeName,
    format: 'iife',
    file: `dist/${name}.js`,
  }
  if (globalName && globalName.extend) {
    iifeSettings.extend = true
  }

  const includeIife = (!iifeName) ? [] : [{
    output: iifeSettings,
    externals: [],
    browser: true
  }]

  const cjsName = main || `lib/${name}.cjs.js`
  const esmName = moduleName || `lib/${name}.es.js`
  const cjsBrowser = (browser && browser[formatName(cjsName)]) ? browser[formatName(cjsName)] : `lib/${name}.browser.cjs.js`
  const esmBrowser = (browser && browser[formatName(esmName)]) ? browser[formatName(esmName)] : `lib/${name}.browser.es.js`

  return [
    // browser Cjs
    {
      output: {
        format: 'cjs',
        file: cjsBrowser,
      },
      browser: true
    },
    // browserEsm
    {
      output: {
        format: 'esm',
        file: esmBrowser,
      },
      browser: true
    },
    // CJS
    {
      output: {
        format: 'cjs',
        file: cjsName,
      },
      browser: false
    },
    // ESM
    {
      output: {
        format: 'esm',
        file: esmName,
      },
      browser: false
    },
    // iife
  ].concat(includeIife)
}

function formatName(str) {
  return str.match(/\.\//) ? str : `./${str}`
}
