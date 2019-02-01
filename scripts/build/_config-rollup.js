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

process.env.NODE_ENV = 'production'
let isProduction = process.env.NODE_ENV === 'production' && !process.env.ROLLUP_WATCH
let doMinify = false

module.exports = function generateConfig(directory) {
  const pkg = require(`${directory}/package.json`)
  const externals = (pkg.dependencies) ? Object.keys(pkg.dependencies) : []
  const inputPath = path.join(`${directory}/src`, 'index.js')
  const rollupConfigs = getFormats(pkg)

  console.log('rollupConfigs', rollupConfigs)
  return rollupConfigs.map((config) => {
    const { format, file } = config.output
    console.log()
    console.log('-----------------------------')
    console.log(`Building ${format} to ${file}`)
    const isESModule = (config.output.format === 'esm')
    const isIIFE = (config.output.format === 'iife')
    return {
      input: inputPath,
      cache: false,
      external: config.externals || externals,
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
*/
function getFormats(pkg) {
  const { name, globalName, browser, module: moduleName, main } = pkg

  const includeIife = (!globalName) ? [] : [{
    output: {
      name: globalName,
      format: 'iife',
      file: `dist/${name}.js`,
    },
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
