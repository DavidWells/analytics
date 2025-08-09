// const minimist = require('minimist')
// const argv = minimist(process.argv.slice(2))
const path = require('path')
const fs = require('fs')
const clean = require('./_clean')
const runRollup = require('./_run-rollup')
const uglify = require('./_uglify')
const dir = process.cwd()

process.env.NODE_ENV = 'production'

async function runBuild(dir) {
  try {
    const data = await runRollup(dir)
    const hasIife = data.find((output) => output.format === 'iife')

    if (hasIife) {
      const filePath = path.join(dir, hasIife.file)
      const destination = path.join(dir, hasIife.file.replace(/\.js/, '.min.js'))
      const fileName = path.basename(destination)

      // 🔥🔥🔥 hack to fix main analytics build. Remove in future
      if (fileName !== 'analytics.min.js') {
        console.log('Uglify file:', filePath)
        console.log('Uglify output:', destination)
        await uglify(filePath, destination)
      }
    }

    // Check if package has "type": "module" and rename CommonJS files
    const pkg = require(path.join(dir, 'package.json'))
    if (pkg.type === 'module') {
      console.log('Package has "type": "module", renaming CommonJS files to .cjs...')
      
      for (const output of data) {
        if (output.format === 'cjs' && output.file.endsWith('.js')) {
          const oldPath = path.join(dir, output.file)
          const newPath = oldPath.replace(/\.js$/, '.cjs')
          const oldMapPath = oldPath + '.map'
          const newMapPath = newPath + '.map'
          
          if (fs.existsSync(oldPath)) {
            console.log(`Renaming ${output.file} -> ${output.file.replace(/\.js$/, '.cjs')}`)
            fs.renameSync(oldPath, newPath)
            
            // Also rename source map if it exists
            if (fs.existsSync(oldMapPath)) {
              fs.renameSync(oldMapPath, newMapPath)
              
              // Update source map reference in the .cjs file
              const cjsContent = fs.readFileSync(newPath, 'utf8')
              const updatedContent = cjsContent.replace(
                /\/\/# sourceMappingURL=(.+)\.js\.map/,
                '//# sourceMappingURL=$1.cjs.map'
              )
              fs.writeFileSync(newPath, updatedContent)
            }
          }
        }
      }
    }

    console.log(`Finished ${dir} build`)
    // console.log('hasIife', hasIife)
    // console.log('data', data)
  } catch (e) {
    console.log('Build error', e)
    process.exit(1)
  }
}

runBuild(dir)
