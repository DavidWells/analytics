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
import pkg from '../../package.json'

const externals = Object.keys(pkg.dependencies)
process.env.NODE_ENV = 'production'
let isProduction = process.env.NODE_ENV === 'production' && !process.env.ROLLUP_WATCH

console.log('process.env.ROLLUP_WATCH', process.env.ROLLUP_WATCH)
console.log('isProduction', isProduction)

export default config => {
  const { format, file } = config.output
  console.log()
  console.log('-----------------------------')
  console.log(`Building ${format} to ${file}`)
  const isESModule = (config.output.format === 'esm')
  const isIIFE = (config.output.format === 'iife')
  return {
    input: 'index.js',
    cache: false,
    // onwarn: (warning, warn) => {
    //   console.log('warning', warning)
    //   // skip certain warnings
    //   if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

    //   // throw on others
    //   if (warning.code === 'NON_EXISTENT_EXPORT') throw new Error(warning.message);

    //   // Use default for everything else
    //   warn(warning);
    // },
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
        BUILD_WEB: JSON.stringify(true),
        BUILD_NODE: JSON.stringify(false),
        'process.env.NODE_ENV': isProduction ? "'production'" : "'development'",
        'process.env.VERSION': JSON.stringify(pkg.version)
      }),
      commonjs({
        include: 'node_modules/**',
        // ignore: [ 'conditional-runtime-dependency' ]
      }),
      ...[
        isProduction && !isESModule && compiler({
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
        isProduction && !isESModule && !isIIFE && terser(),
        isProduction && !isESModule && !isIIFE && minify(),
        isProduction && !isESModule && !isIIFE && uglify({
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
