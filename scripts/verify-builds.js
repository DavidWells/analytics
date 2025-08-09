#!/usr/bin/env node

/**
 * @fileoverview Verify that all files referenced in package.json actually exist after build
 * This script loops through all packages and validates that the files specified in
 * source, main, module, unpkg, and exports fields actually exist on disk
 */

const fs = require('fs')
const path = require('path')

const PACKAGES_DIR = path.join(__dirname, '../packages')
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

/**
 * Log colored messages to console
 * @param {string} color - ANSI color code
 * @param {string} message - Message to log
 */
function log(color, message) {
  console.log(`${color}${message}${RESET}`)
}

/**
 * Check if a file exists relative to a package directory
 * @param {string} packageDir - Package directory path
 * @param {string} filePath - File path to check (relative to package dir)
 * @returns {boolean} - Whether the file exists
 */
function fileExists(packageDir, filePath) {
  if (!filePath) return true // Skip if no file path specified
  
  const fullPath = path.resolve(packageDir, filePath)
  return fs.existsSync(fullPath)
}

/**
 * Check if amdName is correctly written in the built output
 * @param {string} packageDir - Package directory path
 * @param {string} amdName - The amdName value from package.json
 * @returns {boolean} - Whether the amdName is correctly written
 */
function checkAmdName(packageDir, amdName) {
  if (!amdName) return true // Skip if no amdName specified
  
  // Look for browser build files that might contain the amdName
  const browserDir = path.join(packageDir, 'dist/browser')
  if (!fs.existsSync(browserDir)) return true // Skip if no browser directory
  
  const browserFiles = fs.readdirSync(browserDir)
    .filter(file => (file.endsWith('.js') || file.endsWith('.cjs')) && !file.endsWith('.map'))
  
  for (const file of browserFiles) {
    const filePath = path.join(browserDir, file)
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const expectedDeclaration = `var ${amdName}=`
      if (content.includes(expectedDeclaration)) {
        return true
      }
    } catch (error) {
      // If we can't read the file, continue to next file
      continue
    }
  }
  
  return false
}

/**
 * Validate package.json file references
 * @param {string} packagePath - Path to package directory
 * @param {Object} pkg - Parsed package.json content
 * @param {boolean} silent - Whether to suppress logging (default: false)
 * @returns {Array} - Array of missing files
 */
function validatePackage(packagePath, pkg, silent = false) {
  const packageName = pkg.name || path.basename(packagePath)
  const missingFiles = []
  
  // Fields to validate
  const fieldsToCheck = [
    { field: 'source', path: pkg.source },
    { field: 'main', path: pkg.main },
    { field: 'module', path: pkg.module },
    { field: 'unpkg', path: pkg.unpkg }
  ]
  
  // Check basic fields
  for (const { field, path: filePath } of fieldsToCheck) {
    if (filePath && !fileExists(packagePath, filePath)) {
      missingFiles.push({ field, path: filePath, packageName })
    } else if (filePath && !silent) {
      console.log(`File exists: ${path.resolve(packagePath, filePath)} - ${field}`)
    }
  }
  
  // Check browser field
  if (pkg.browser && typeof pkg.browser === 'object') {
    for (const [key, value] of Object.entries(pkg.browser)) {
      // Check both the key (server path) and value (client path)
      if (!fileExists(packagePath, key)) {
        missingFiles.push({ field: `browser.${key}`, path: key, packageName })
      } else if (!silent) {
        console.log(`File exists: ${path.resolve(packagePath, key)} - browser.${key}`)
      }
      if (!fileExists(packagePath, value)) {
        missingFiles.push({ field: `browser.${key}`, path: value, packageName })
      } else if (!silent) {
        console.log(`File exists: ${path.resolve(packagePath, value)} - browser.${key}`)
      }
    }
  }
  
  // Check exports field
  if (pkg.exports) {
    if (typeof pkg.exports === 'string') {
      if (!fileExists(packagePath, pkg.exports)) {
        missingFiles.push({ field: 'exports', path: pkg.exports, packageName })
      } else if (!silent) {
        console.log(`File exists: ${path.resolve(packagePath, pkg.exports)} - exports`)
      }
    } else if (typeof pkg.exports === 'object') {
      // Check nested export paths
      function checkExportPaths(exports, prefix = '') {
        for (const [key, value] of Object.entries(exports)) {
          const currentPath = prefix ? `${prefix}.${key}` : key
          
          if (typeof value === 'string') {
            if (!fileExists(packagePath, value)) {
              missingFiles.push({ 
                field: `exports.${currentPath}`, 
                path: value, 
                packageName 
              })
            } else if (!silent) {
              console.log(`File exists: ${path.resolve(packagePath, value)} - exports.${currentPath}`)
            }
          } else if (typeof value === 'object' && value !== null) {
            checkExportPaths(value, currentPath)
          }
        }
      }
      
      checkExportPaths(pkg.exports)
    }
  }
  
  // Check types field if it exists
  if (pkg.types && !fileExists(packagePath, pkg.types)) {
    missingFiles.push({ field: 'types', path: pkg.types, packageName })
  } else if (pkg.types && !silent) {
    console.log(`File exists: ${path.resolve(packagePath, pkg.types)} - types`)
  }
  
  // Check amdName field if it exists
  if (pkg.amdName && !checkAmdName(packagePath, pkg.amdName)) {
    missingFiles.push({ field: 'amdName', path: `dist/browser/*.js (should contain "var ${pkg.amdName}=")`, packageName })
  } else if (pkg.amdName && !silent) {
    console.log(`AmdName verified: ${pkg.amdName} - amdName`)
  }
  
  return missingFiles
}

/**
 * Main verification function
 */
function verifyBuilds() {
  log(BOLD, '🔍 Verifying build outputs for all packages...\n')
  
  let totalPackages = 0
  let packagesWithErrors = 0
  let totalMissingFiles = 0
  
  try {
    // Find all package.json files in packages directory
    const packageDirs = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
    
    const packageJsonFiles = packageDirs
      .map(dir => path.join(dir, 'package.json'))
      .filter(packageJsonPath => {
        const fullPath = path.join(PACKAGES_DIR, packageJsonPath)
        return fs.existsSync(fullPath)
      })
    
    if (packageJsonFiles.length === 0) {
      log(YELLOW, `⚠️  No package.json files found in ${PACKAGES_DIR}`)
      return
    }
    
    log(GREEN, `📦 Found ${packageJsonFiles.length} packages to verify\n`)
    
    for (const packageJsonFile of packageJsonFiles) {
      const packagePath = path.join(PACKAGES_DIR, path.dirname(packageJsonFile))
      const packageJsonPath = path.join(PACKAGES_DIR, packageJsonFile)
      
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        const packageName = pkg.name || path.basename(packagePath)
        
        totalPackages++
        
        const missingFiles = validatePackage(packagePath, pkg)
        
        if (missingFiles.length === 0) {
          log(GREEN, `✅ ${packageName}`)
          console.log('───────────────────────────────')

        } else {
          packagesWithErrors++
          totalMissingFiles += missingFiles.length
          
          log(RED, `❌ ${packageName}`)
          
          for (const { field, path: filePath } of missingFiles) {
            log(RED, `   Missing ${field}: ${filePath}`)
          }
          
          console.log() // Empty line for readability
        }
        
      } catch (error) {
        log(RED, `❌ Error reading ${packageJsonFile}: ${error.message}`)
        packagesWithErrors++
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(50))
    log(BOLD, '📊 SUMMARY')
    console.log('='.repeat(50))
    
    log(GREEN, `✅ Total packages checked: ${totalPackages}`)
    
    if (packagesWithErrors === 0) {
      log(GREEN, `✅ All packages have valid file references!`)
    } else {
      log(RED, `❌ Packages with errors: ${packagesWithErrors}`)
      log(RED, `❌ Total missing files: ${totalMissingFiles}`)
      
      // Show detailed error information
      console.log()
      log(BOLD, '📋 ERROR DETAILS:')
      console.log()
      
      // Collect and display all errors without re-running validation
      for (const packageJsonFile of packageJsonFiles) {
        const packagePath = path.join(PACKAGES_DIR, path.dirname(packageJsonFile))
        const packageJsonPath = path.join(PACKAGES_DIR, packageJsonFile)
        
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
          const packageName = pkg.name || path.basename(packagePath)
          
          // Use silent validation to avoid logging
          const missingFiles = validatePackage(packagePath, pkg, true)
          
          if (missingFiles.length > 0) {
            log(RED, `📦 Package: ${packageName}`)
            log(RED, `📍 Location: ${packagePath}`)
            log(RED, `📄 Package.json: ${packageJsonFile}`)
            
            for (const { field, path: filePath } of missingFiles) {
              log(RED, `   ❌ Missing ${field}: ${filePath}`)
            }
            console.log()
          }
        } catch (error) {
          log(RED, `📦 Package: ${path.basename(path.dirname(packageJsonFile))}`)
          log(RED, `📍 Location: ${path.join(PACKAGES_DIR, path.dirname(packageJsonFile))}`)
          log(RED, `📄 Package.json: ${packageJsonFile}`)
          log(RED, `   ❌ Error reading package.json: ${error.message}`)
          console.log()
        }
      }
    }
    
    // Exit with error code if there are missing files
    if (totalMissingFiles > 0) {
      console.log()
      log(RED, '💥 Build verification failed! Please ensure all referenced files exist.')
      process.exit(1)
    } else {
      console.log()
      log(GREEN, '🎉 All build outputs verified successfully!')
      process.exit(0)
    }
    
  } catch (error) {
    log(RED, `💥 Error during verification: ${error.message}`)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifyBuilds()
}

module.exports = { verifyBuilds, validatePackage, fileExists }