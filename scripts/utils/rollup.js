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

function makeModuleName(name) {
  const baseName = path.basename(name, '.js')
  return {
    "main": `dist/${baseName}.cjs.js`,
    "module": `dist/${baseName}.esm.js`,
    "browser": `dist/${baseName}.js`,
  }
}

function getRollupConfig(fileName, isProduction) {
  // console.log('__dirname', __dirname)
  // console.log('cwd', process.cwd())
  const dir = process.cwd()
  const pkg = makeModuleName(fileName)
  const externals = (pkg.dependencies) ? Object.keys(pkg.dependencies) : []
  const filePath = path.join(`${dir}/lib`, fileName)
  const esOutputPath = path.join(dir, pkg.module)
  const iifeOutputPath = path.join(dir, pkg.browser)
  const cjsOutputPath = path.join(dir, pkg.main)

  const globalName = path.basename(fileName, '.js')
  const finalName = (globalName === 'index') ? 'analyticUtils' : globalName
  console.log('globalName', finalName)
  /*
    "main": "dist/analytics-utils.cjs.js",
    "module": "dist/analytics-utils.esm.js",
    "browser": "dist/analytics-utils.js",
  */

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
      isProduction && closure({
        compilationLevel: 'SIMPLE',
        languageIn: 'ECMASCRIPT5_STRICT',
        languageOut: 'ECMASCRIPT5_STRICT',
        env: 'CUSTOM',
        warningLevel: 'QUIET',
        applyInputSourceMaps: false,
        useTypesForOptimization: false,
        processCommonJsModules: false,
      }),
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

  return [
    // Global window build
    {
      input: filePath,
      output: {
        name: finalName,
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

module.exports = function buildPlugin(pluginNameSpace, isProduction) {
  if (!pluginNameSpace) {
    return reject('Missing plugin namespace. --nameSpace xyzFolder')
  }

  const config = getRollupConfig(pluginNameSpace, isProduction)
  const builds = config.map((conf) => {
    return rollup(conf).then((result) => {
      result.write({
        file: conf.output.file,
        format: conf.output.format,
        // interop: false,
        name: conf.output.name,
        // sourcemap: false,
      })
      console.log(`End ${conf.output.format} build ${conf.output.file}`)
    })
  })

  return Promise.all(builds)
}