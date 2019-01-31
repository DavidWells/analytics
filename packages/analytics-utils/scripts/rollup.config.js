import babel from 'rollup-plugin-babel'
import minify from 'rollup-plugin-babel-minify'
import replace from 'rollup-plugin-replace'
import nodeResolve from 'rollup-plugin-node-resolve'
import removeNodeBuiltIns from 'rollup-plugin-node-builtins'
import stripBanner from 'rollup-plugin-strip-banner'
import compiler from '@ampproject/rollup-plugin-closure-compiler'
import commonjs from 'rollup-plugin-commonjs'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import { uglify } from 'rollup-plugin-uglify'
import { terser } from 'rollup-plugin-terser'
import pkg from '../package.json'

const externals = pkg.dependencies ? Object.keys(pkg.dependencies) : []
process.env.NODE_ENV = 'production'

let isProduction = process.env.NODE_ENV === 'production' && !process.env.ROLLUP_WATCH
let doMinify = false

export default config => {
  const { format, file } = config.output
  console.log()
  console.log('-----------------------------')
  console.log(`Building ${format} to ${file}`)
  const isESModule = (config.output.format === 'esm')
  const isIIFE = (config.output.format === 'iife')
  return {
    input: 'src/index.js',
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
}
