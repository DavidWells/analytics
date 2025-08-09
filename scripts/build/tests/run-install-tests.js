#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

console.log('🧪 Running installation verification tests...\n')

// Test CommonJS installation
console.log('📦 Testing CommonJS installation...')
try {
  const cjsOutput = execSync('npm test', { 
    cwd: path.join(__dirname, 'cjs-test'), 
    encoding: 'utf8' 
  })
  console.log('✅ CommonJS test passed')
  // console.log(cjsOutput)
} catch (error) {
  console.log('❌ CommonJS test failed')
  console.log(error.stdout || error.message)
  process.exit(1)
}

// Test ESM installation  
console.log('\n📦 Testing ESM installation...')
try {
  const esmOutput = execSync('npm test', {
    cwd: path.join(__dirname, 'esm-test'),
    encoding: 'utf8'
  })
  console.log('✅ ESM test passed')
  // console.log(esmOutput)
} catch (error) {
  console.log('❌ ESM test failed')
  console.log(error.stdout || error.message)
  process.exit(1)
}

console.log('\n🎉 All installation tests passed!')
console.log('📝 README install instructions are verified as correct.')