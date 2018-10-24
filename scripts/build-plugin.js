const path = require('path')
const { rollup } = require('rollup')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const removeNodeBuiltIns = require('rollup-plugin-node-builtins')
const uglify = require('rollup-plugin-uglify')
const replace = require('rollup-plugin-replace')
const stripBanner = require('rollup-plugin-strip-banner')
const closure = require('rollup-plugin-closure-compiler-js')
const argv = require('minimist')(process.argv.slice(2))
const pluginGlobalNameSpace = argv.nameSpace
const stage = argv.env || 'production'
// process.env.NODE_ENV = 'development'
process.env.NODE_ENV = stage
let isProduction = process.env.NODE_ENV === 'production'
// isProduction = false

const closureOptions = {
  compilationLevel: 'SIMPLE',
  languageIn: 'ECMASCRIPT5_STRICT',
  languageOut: 'ECMASCRIPT5_STRICT',
  env: 'CUSTOM',
  warningLevel: 'QUIET',
  applyInputSourceMaps: false,
  useTypesForOptimization: false,
  processCommonJsModules: false,
}

const sharedPlugins = [
  stripBanner({
    exclude: 'node_modules/**/*',
  }),
  nodeResolve({
    jsnext: true
  }),
  babel({
    exclude: 'node_modules/**',
    plugins: ['external-helpers']
  }),
  // Remove 'use strict' from individual source files.
  {
    transform(source) {
      return source.replace(/['"]use strict['"']/g, '')
    },
  },
  removeNodeBuiltIns(),
  commonjs({
    include: 'node_modules/**',
  }),
]

const compilerPlugins = [
  ...sharedPlugins,
  ...[
    isProduction && closure(closureOptions),
    isProduction && uglify({
      compress: {
        // screw_ie8: true,
        warnings: false
      },
      output: {
        comments: false
      },
      sourceMap: false
    })
  ],
]

function getConfig(windowGlobalName) {
  // console.log('__dirname', __dirname)
  // console.log('cwd', process.cwd())
  const dir = process.cwd()
  const pkg = require(`${dir}/package.json`)
  const externals = (pkg.dependencies) ? Object.keys(pkg.dependencies) : []
  const filePath = path.join(`${dir}/lib`, 'index.js')
  const esOutputPath = path.join(dir, pkg.module)
  const iifeOutputPath = path.join(dir, pkg.browser)
  const cjsOutputPath = path.join(dir, pkg.main)

  return [
    // Global window build
    {
      input: filePath,
      output: {
        name: windowGlobalName,
        file: iifeOutputPath,
        format: 'iife',
      },
      plugins: compilerPlugins
    },
    // CommonJS (for Node) build.
    {
      input: filePath,
      external: externals,
      output: {
        file: cjsOutputPath,
        format: 'cjs'
      },
      plugins: compilerPlugins,
    },
    // ES module (for bundlers) build.
    {
      input: filePath,
      external: externals,
      output: {
        file: esOutputPath,
        format: 'es'
      },
      plugins: sharedPlugins,
    }
  ]
}

function buildEverything() {
  if (!pluginGlobalNameSpace) {
    console.log('Missing Plugin folder name. --plugin xyzFolder')
    process.exit(1)
  }
  const config = getConfig(pluginGlobalNameSpace)
  config.forEach((conf) => {
    rollup(conf).then((result) => {
      result.write({
        file: conf.output.file,
        format: conf.output.format,
        // interop: false,
        name: conf.output.name,
        // sourcemap: false,
      })
      console.log(`End ${conf.output.format} build ${conf.output.file}`)
    }).catch((e) => {
      console.log('error', e)
    })
  })
}

console.log(`Start ${pluginGlobalNameSpace} build`)
buildEverything()
