import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import removeNodeBuiltIns from 'rollup-plugin-node-builtins'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'
import stripBanner from 'rollup-plugin-strip-banner'
import closure from 'rollup-plugin-closure-compiler-js'
import compiler from '@ampproject/rollup-plugin-closure-compiler';
// import outputFilesize from 'rollup-plugin-filesize'
// import depSizes from 'rollup-plugin-sizes'
// import analyze from 'rollup-analyzer-plugin'
import packageJSON from './package.json'

//process.env.NODE_ENV = 'development'
process.env.NODE_ENV = 'production'
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

const externals = Object.keys(packageJSON.dependencies)
// console.log('externals', externals)
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
  replace({
    BUILD_WEB: JSON.stringify(true),
    BUILD_NODE: JSON.stringify(false),
    'process.env.NODE_ENV': isProduction ? "'production'" : "'development'",
    'process.env.VERSION': JSON.stringify(packageJSON.version)
  }),
  commonjs({
    include: 'node_modules/**',
    // ignore: [ 'conditional-runtime-dependency' ]
  }),
  // depSizes(),
  // analyze({limit: 5}),
  // outputFilesize()
]

export default [
  // browser-friendly iife build
  {
    input: 'index.js',
    output: {
      name: 'window',
      file: 'dist/analytics.js',
      format: 'iife',
      extend: true
      // iife for global window
      // umd for global window
      // cjs for module format
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
        plugins: ['external-helpers']
      }),
      {
        transform(source) {
          return source.replace(/['"]use strict['"']/g, '')
        },
      },
      removeNodeBuiltIns(),
      replace({
        BUILD_WEB: JSON.stringify(true),
        BUILD_NODE: JSON.stringify(false),
        'process.env.NODE_ENV': isProduction ? "'production'" : "'development'",
        'process.env.VERSION': JSON.stringify(packageJSON.version)
      }),
      commonjs({
        include: 'node_modules/**',
        // ignore: [ 'conditional-runtime-dependency' ]
      }),
      nodeResolve({
        jsnext: true,
        browser: true,
        builtins: false,
        main: true,
      }),
      ...[
        isProduction && compiler({
          compilationLevel: 'SIMPLE',
          languageIn: 'ECMASCRIPT5_STRICT',
          languageOut: 'ECMASCRIPT5',
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
  },

  // CommonJS (for Node) build.
  {
    input: 'index.js',
    external: externals,
    output: [
      { file: packageJSON.main, format: 'cjs' }
    ],
    plugins: [
      ...sharedPlugins,
      ...[
        isProduction && compiler(closureOptions),
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
    ],
  },
  // ES module (for bundlers) build.
  {
    input: 'index.js',
    external: externals,
    output: [
      { file: packageJSON.module, format: 'es' }
    ],
    plugins: sharedPlugins,
  }
]
