const path = require('path')
const fs = require('fs')
const { inspect } = require('util')
const markdownMagic = require('markdown-magic')
const dox = require('dox')
const outdent = require('outdent')
const prettier = require('prettier')
const parseSourceCode = require('./docs/parse').sync
const getPluginDetails = require('./docs/get-plugin-details')
const indentString = require('indent-string')
const { getSizeInfo } = require('./getSize')

const fileExists = (s) => new Promise(r => fs.access(s, fs.F_OK, e => r(!e)))

// Force sync processing until markdown-magic 2.0 is released

function deepLog(data) {
  console.log(inspect(data, {showHidden: false, depth: null, colors: true}))
}

const SRC_LINKS = {
  PageData: 'https://github.com/DavidWells/analytics/blob/master/packages/analytics-core/src/modules/page.js#L33',
  track: 'https://getanalytics.io/api/#analyticstrack',
  page: 'https://getanalytics.io/api/#analyticspage',
  identify: 'https://getanalytics.io/api/#analyticsidentify',
  reset: 'https://getanalytics.io/api/#analyticsreset',
  'Array.<AnalyticsPlugin>': 'https://getanalytics.io/plugins',
}

const cache = {}

const config = {
  transforms: {
    // https://github.com/moleculerjs/moleculer-addons/blob/master/readme-generator.js#L11
    PACKAGES(content, options) {
      const base = path.resolve('packages')
      const packages = fs.readdirSync(path.resolve('packages'))
        .filter(pkg => !/^\./.test(pkg))
        .map(pkg => ([pkg, fs.readFileSync(path.join(base, pkg, 'package.json'), 'utf8')]))
        .filter(([pkg, json]) => {
          const parsed = JSON.parse(json)
          return parsed.private !== true
        })
        .map(([pkg, json]) => {
          const { name, description } = JSON.parse(json)
          return `- [${name}](./packages/${pkg}) ${description} [npm link](https://www.npmjs.com/package/${name}).`
        })
        .join('\n')
      return packages
    },
    pkgSize: async (content, options, context) => {
      const dir = path.dirname(context.originalPath)
      let fileToCheck
      const hasPlural = options.hasOwnProperty('plural') || options.plural === true

      if (options.src) {
        fileToCheck = path.resolve(dir, options.src)
      } else {
        const pkg = JSON.parse(fs.readFileSync(path.resolve(dir, 'package.json')))
        fileToCheck = path.resolve(dir, pkg.main) 
      }
      if (!fileToCheck) {
        console.log(`Missing options.src ${options.src} or pkg.main in ${dir}`)
        process.exit(1)
      }
      const exists = await fileExists(fileToCheck)
      if (fileToCheck && !exists) {
        console.log(`Missing options.src ${options.src} or pkg.main in ${dir}`)
        process.exit(1)
      }

      const code = fs.readFileSync(path.resolve(dir, fileToCheck))
      const sizeData = await getSizeInfo(code, fileToCheck)
      
      // console.log(sizeData)
      return `\`${sizeData.size}\``
    },
    PLUGINS(content, options) {
      const base = path.resolve('packages')
      const packages = fs.readdirSync(path.resolve('packages'))
        .filter(pkg => !/^\./.test(pkg))
        .filter(pkg => pkg !== 'analytics')
        .map(pkg => ([pkg, JSON.parse(fs.readFileSync(path.join(base, pkg, 'package.json'), 'utf8'))]))
        .filter(([pkg, json]) => {
          return json.private !== true
        })
        // alphabetize list
        .sort((a, b) => {
          const one = a[1]
          const two = b[1]
          var textA = one.name.toLowerCase()
          var textB = two.name.toLowerCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
        .map(([pkg, json]) => {
          const { name, description } = json
          return `- [${name}](https://github.com/DavidWells/analytics/tree/master/packages/${pkg}) ${description} [npm link](https://www.npmjs.com/package/${name}).`
        }).concat('- Add yours! 👇')
        .join('\n')
      return packages
    },
    EXTERNAL_PLUGINS(content, options) {
      const externalPackages = require('../external-plugins.json')

      const sorted = externalPackages
        // alphabetize list
        .sort((a, b) => {
          var textA = a.name.toLowerCase()
          var textB = b.name.toLowerCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
        .map(({ name, url, description }) => {
          return `- [${name}](${url}) ${description}`
        })
        .concat('- [Add a plugin link](https://github.com/DavidWells/analytics/blob/master/external-plugins.json)')
        .join('\n')
      return sorted
    },
    EVENT_DOCS(content, options) {
      const fileContents = fs.readFileSync(path.join(__dirname, '..', 'packages/analytics-core/src/events.js'), 'utf-8')
      const docBlocs = dox.parseComments(fileContents, { raw: true, skipSingleStar: true })

      const events = docBlocs.filter((d) => {
        return !d.description.summary.match(/^\*\*/)
      })
      let md = '| Event | Description |\n'
      md += '|:------|:-------|\n'
      events.forEach((data) => {
        const eventName = data.description.summary.match(/^`(.*)`/)
        let desc = data.description.summary.replace(eventName[0], '')
        /* remove prefixed “ - whatever" */
        desc = desc.replace(/^[\s|-]-?\s/, '')
        /* replace \n with <br> tags */
        desc = desc.replace(/\n/g, '<br/>')
        // console.log('data', data)
        md += `| **\`${eventName[1]}\`** | ${desc} |\n`
      })
      return md.replace(/^\s+|\s+$/g, '')
    },
    PLUGIN_DOCS(content, options, instance) {
      let pluginDocs = ''
      let pluginData
      const { originalPath } = instance
      if (cache[originalPath]) {
        pluginData = cache[originalPath]
      } else {
        pluginData = getPluginDetails(originalPath)
        cache[originalPath] = pluginData
      }
      if (pluginData && pluginData.length) {
        // deepLog(data)
        let mainExample = pluginData.find((d) => d.platform === 'browser')
        if (!mainExample) {
          mainExample = pluginData.find((d) => d.platform === 'node')
        }

        if (!mainExample) {
          return ''
        }
        // Chug through plugin data and print docs
        pluginDocs = mainUsageBlock(mainExample, pluginData)
      }
      return `${pluginDocs}`
    },
    API_DOCS(content, options) {
      const fileContents = fs.readFileSync(path.join(__dirname, '..', 'packages/analytics-core/src/index.js'), 'utf-8')
      const unsortedDocBlocs = dox.parseComments(fileContents, { raw: true, skipSingleStar: true })

      const end = unsortedDocBlocs.filter((element) => {
        return PLUGIN_KEYS.includes(element.ctx.name)
      })
      const begin = unsortedDocBlocs.filter((element) => {
        return !PLUGIN_KEYS.includes(element.ctx.name)
      })
      const docBlocs = begin.concat(end).filter((element) => {
        return !element.ctx.name.match(/(Payload|Context)$/)
      })
      let updatedContent = ''
      const removeItems = ['analytics.instance', 'analytics.return']
      docBlocs.forEach((data) => {
        const niceName = formatName(data.ctx.name)
        if (!removeItems.includes(niceName)) {
          updatedContent += `### ${formatName(data.ctx.name)}\n\n`
          updatedContent += `${data.description.full}\n\n`
          updatedContent += `${formatArguments(data.tags)}`
          updatedContent += formatExample(data.tags).join('\n')
          updatedContent += `\n`
        }
      })
      return updatedContent.replace(/^\s+|\s+$/g, '')
    }
  }
}

function mainUsageBlock(primaryExample, allData) {
  const { data, pkg } = primaryExample
  const platforms = getPlatforms(allData)
  const main = data.jsdoc.find((doc) => Boolean(doc.examples))

  const exampleFunctionName = main.name
  const exampleCode = main.examples[0]
  const code = `
import Analytics from 'analytics'
import ${exampleFunctionName} from '${pkg.name}'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    ${exampleCode}
  ]
})

${renderRelevantMethods(data)}
`

  const providerName = cleanName(pkg.projectMeta.provider.name)
  const ABOUT_METHODS = aboutMethods(providerName)

  const API_METHODS = ['page', 'track', 'identify', 'reset']

  /* Get additional Usage examples */
  const additionalExamples = allData.reduce((acc, d) => {
    acc = acc.concat(getUsageExamples(d, data))
    return acc
  }, [])
    .sort(sortUsageExamples)
    .map((ex) => ex.text)
    .join('\n')

  let exposedFuncs
  const apiDocs = allData.map((y) => {
    const name = getPlatformName(y)
    exposedFuncs = getExposedFunctions(y.data)
    const exp = exposedFuncs
    const niceName = (name === 'node.js') ? `server-side` : name
    const jsDoc = renderJsDocs(y.data, y, niceName)
    const niceText = (name === 'node.js') ? `${niceName} ${name}` : `client side ${niceName}`
    const capsName = capitalizeFirstLetter(niceName)
    const apiMethodsExposed = exp
      .filter((x) => API_METHODS.includes(x))
      .map((x) => {
        const link = SRC_LINKS[x]
        const linkText = (link) ? `[analytics.${x}](${link})` : x
        return `- **${linkText}** - ${ABOUT_METHODS[x]}`
      }).join('\n')
    // console.log('apiMethodsExposed', apiMethodsExposed)
    let renderMethods = 'See below from browser API'
    if (apiMethodsExposed) {
      renderMethods = `The ${providerName} ${niceText} plugin works with these analytic api methods:

${apiMethodsExposed}`
    }

    return `## ${capsName} usage

${renderMethods}

### ${capsName} API

${jsDoc}`
  })

return `
## How to use

The \`${pkg.name}\` package works in ${renderPlatformSentence(platforms)}. To use, install the package, include in your project and initialize the plugin with [analytics](https://www.npmjs.com/package/analytics).

Below is an example of how to use the ${primaryExample.platform} plugin.

\`\`\`js
${indentString(formatCode(code), 0)}
\`\`\`
${whatThisEnablesText(exampleFunctionName, providerName, exposedFuncs)}
See [additional implementation examples](#additional-examples) for more details on using in your project.

## Platforms Supported

The \`${pkg.name}\` package works in ${renderPlatformSentence(platforms)}

${apiDocs.join('\n')}

## Additional examples

Below are additional implementation examples.

${additionalExamples}
`
}

function renderPlatformSentence(platforms) {
  const NICE_NAMES = {
    'Browser': 'the browser',
    'Node.js': 'server-side in Node.js'
  }

  return platforms.map((x) => {
    return `[${NICE_NAMES[x]}](#${getPlatformNiceName(x)}-usage)`
  }).join(' and ')
}

function formatCode(code, type = 'babel') {
  return prettier.format(code, { semi: false, singleQuote: true, parser: type })
}

const removeList = ['NAMESPACE', 'name', 'config', 'loaded', 'initialize']
function removeMethod(name) {
  return !removeList.includes(name)
}

function sortUsageExamples(a, b) {
  if (a.order < b.order) return -1
  if (a.order > b.order) return 1
  return 0
}

function getUsageExamples(d) {
  const { data, pkg, platform, dir } = d
  if (platform === 'node') {
    return [{
      name: 'es6node',
      order: 1,
      text: es6Usage(data, pkg)
    },
    {
      name: 'node',
      order: 2,
      text: nodeUsage(data, pkg)
    }]
  } else {
    const esmHtml = browserESMUsage(data, pkg)
    const vanillaHtml = browserStandaloneUsage(data, pkg, dir)

    return [{
      name: 'esHtml',
      order: 4,
      text: esmHtml
    },
    {
      name: 'html',
      order: 3,
      text: vanillaHtml
    }]
  }
}

function getPlatforms(allData) {
  return allData.map((d) => {
    return capitalizeFirstLetter(getPlatformName(d))
  })
}

function getPlatformName(data) {
  return (data.platform === 'node') ? 'node.js' : data.platform
}

function renderJsDocs(data, allData, platform) {
  // console.log('allData', allData)
  const defaultExport = data.ast.foundExports.find((x) => Boolean(x.isDefault))
  let jsDocForDefaultExport = data.jsdoc.find((x) => x.id === defaultExport.name)
  if (!jsDocForDefaultExport) {
    if (data.jsdoc && data.jsdoc.length === 1) {
      jsDocForDefaultExport = data.jsdoc[0]
    }
    if (!jsDocForDefaultExport) {
      throw new Error(`Missing default export for ${allData.dir}`)
    }
  }
  const jsdocContent = jsDocFormatArguments(jsDocForDefaultExport.params, platform)
  const jsDocExample = jsDocRenderExample(jsDocForDefaultExport.examples[0], allData)
  return `${jsDocExample}${jsdocContent}`
}

function jsDocFormatArguments(params, platform) {
  if (!params) return ''
  const theArgs = params.filter((param) => {
    return param.name !== 'pluginConfig'
  }).map((param) => {
    return jsDocRenderArg(param)
  })
  // console.log('theArgs', theArgs)
  if (theArgs.length) {
    return `

### Configuration options for ${platform}

| Option | description |
|:---------------------------|:-----------|
${theArgs.join('\n')}
`
  }
  return ''
}

function jsDocRenderArg(param) {
  const optionalText = (param.optional) ? '_optional_ - ' : '**required** - '
  const type = `${param.type.names[0]}`
  // md += `| **[${param.name} - \``](${data.githubUrl})** <br/> by [${userName}](${profileURL}) <br/>`
  return `| \`${param.name.replace(/^pluginConfig\./, '')}\` <br/>${optionalText}${type}| ${param.description} |`
}

function jsDocRenderExample(example, allData) {
  if (!example) {
    return ''
  }
  const main = allData.data.jsdoc.find((doc) => Boolean(doc.examples))
  const name = main.name
  const code = `${generateImportStatement(name, allData.pkg.name)}

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    ${example.replace(/^\s+|\s+$/g, '')}
  ]
})
`
  return `\`\`\`js
${formatCode(code)}
\`\`\``
}

function getPlatformNiceName(name) {
  const lower = name.toLowerCase()
  return (lower === 'node.js') ? `server-side` : lower
}

function cleanName(name) {
  return name.replace(/@analytics\//, '')
}

function aboutMethods(name) {
  return {
    'page': `Sends page views into ${name}`,
    'track': `Track custom events and send to ${name}`,
    'identify': `Identify visitors and send details to ${name}`,
    'reset': `Reset browser storage cookies & localstorage for ${name} values`
  }
}

const DATA_METHODS = ['page', 'track', 'identify']
function whatThisEnablesText(name, provider, methods) {
  const dataMethods = methods.filter((x) => DATA_METHODS.includes(x))
  if (!dataMethods.length) {
    return ''
  }
  const dataMethodText = dataMethods
    .map((x) => {
      const link = SRC_LINKS[x]
      const linkText = (link) ? `[analytics.${x}](${link})` : `\`analytics.${x}\``
      return linkText
    })
    .reduce((acc, curr, i) => {
      if ((dataMethods.length - 1) === i) {
        acc = `${acc}or ${curr}`
        return acc
      }
      acc = `${acc}${curr}, `
      return acc
    }, '')
  return `
After initializing \`analytics\` with the \`${name}\` plugin, data will be sent into ${provider} whenever ${dataMethodText} are called.
`
}

function generateImportStatement(name, pkgName) {
  return `import Analytics from 'analytics'
import ${name} from '${pkgName}'`
}

// ${example.replace(/^\s+|\s+$/g, '')},
function es6Usage(data, pkg) {
  const main = data.jsdoc.find((doc) => Boolean(doc.examples))

  const name = main.name
  const exampleCode = main.examples[0]
  const code = `
${generateImportStatement(name, pkg.name)}

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    ${exampleCode}
    // ...other plugins
  ]
})

${renderRelevantMethods(data)}
`

return `<details>
  <summary>Server-side ES6</summary>

  \`\`\`js
${indentString(formatCode(code), 2)}
  \`\`\`

</details>
`
}

function getExposedFunctions(data) {
  return data.ast.methodsByName.filter(removeMethod)
}

function renderRelevantMethods(data) {
  // console.log('data', data)
  const exposedFunctions = getExposedFunctions(data)
  // console.log('exposedFunctions', exposedFunctions)
  let page = ''
  if (exposedFunctions.includes('page')) {
    const hasCustom = data.jsdoc.find((doc) => doc.longname === 'page')
    if (hasCustom && hasCustom.examples) {
      page = `
      /* Track a page view */
      ${hasCustom.examples[0]}
      `
    } else {
      page = `
      /* Track a page view */
      analytics.page()
      `
    }
  }
  let track = ''
  if (exposedFunctions.includes('track')) {
    const hasCustom = data.jsdoc.find((doc) => doc.longname === 'track')
    if (hasCustom && hasCustom.examples) {
      track = `
      /* Track a custom event */
      ${hasCustom.examples[0]}
      `
    } else {
      track = `
      /* Track a custom event */
      analytics.track('cartCheckout', {
        item: 'pink socks',
        price: 20
      })
      `
    }
  }

  let identify = ''
  if (exposedFunctions.includes('identify')) {
    const hasCustom = data.jsdoc.find((doc) => doc.longname === 'identify')
    if (hasCustom && hasCustom.examples) {
      identify = `
      /* Identify a visitor */
      ${hasCustom.examples[0]}
      `
    } else {
      identify = `
      /* Identify a visitor */
      analytics.identify('user-id-xyz', {
        firstName: 'bill',
        lastName: 'murray',
      })`
    }
  }

  // TODO add .reset

  return `${page}${track}${identify}`
}

function nodeUsage(data, pkg) {
  // Find doc block with example (should only be one the main function)
  const main = data.jsdoc.find((doc) => Boolean(doc.examples))

  const name = main.name
  const exampleCode = main.examples[0]

  const code = `
const analyticsLib = require('analytics').default
const ${name} = require('${pkg.name}').default

const analytics = analyticsLib({
  app: 'my-app-name',
  plugins: [
    ${exampleCode}
  ]
})

${renderRelevantMethods(data)}`

  return `<details>
  <summary>Server-side Node.js with common JS</summary>

  If using node, you will want to import the \`.default\`

  \`\`\`js
${indentString(formatCode(code), 2)}
  \`\`\`

</details>
`
}

function browserStandaloneUsage(data, pkg, dir) {
  const browserFile = path.join(dir, 'dist', `${pkg.name}.js`)

  const xx = parseSourceCode(browserFile)

  let initSet = false
  const exportData = xx.ast.foundExports.filter((x) => {
    return x.isDefault
  }).reduce((acc, curr) => {
    if (initSet) return acc
    if (curr.name === 'init') {
      initSet = true
      return curr
    }
    return curr
  }, {})

  const defaultExportName = (exportData && exportData.name) ? `${pkg.globalName}.${exportData.name}` : pkg.globalName
  // console.log('defaultExportName', defaultExportName)
  // Find doc block with example (should only be one the main function)
  const main = data.jsdoc.find((doc) => Boolean(doc.examples))

  const exampleCode = main.examples[0]
  // TODO cross reference the main exports and named exports to verify whatever.init
  const code = `
<!doctype html>
<html>
  <head>
    <title>Using ${pkg.name} in HTML</title>
    <script src="https://unpkg.com/analytics/dist/analytics.min.js"></script>
    <script src="https://unpkg.com/${pkg.name}/dist/${pkg.name}.min.js"></script>
    <script type="text/javascript">
      /* Initialize analytics */
      var Analytics = _analytics.init({
        app: 'my-app-name',
        plugins: [
          ${exampleCode.replace(main.name, `${defaultExportName}`)}
        ]
      })

      ${renderRelevantMethods(data)}
    </script>
  </head>
  <body>
    ....
  </body>
</html>
`

  return `<details>
  <summary>Using in HTML</summary>

  Below is an example of importing via the unpkg CDN. Please note this will pull in the latest version of the package.

  \`\`\`html
${indentString(formatCode(code, 'html'), 2)}
  \`\`\`

</details>
`
}

function browserESMUsage(data, pkg) {
  // Find doc block with example (should only be one the main function)
  const main = data.jsdoc.find((doc) => Boolean(doc.examples))

  const exampleCode = main.examples[0]
  const esmModulePath = `./${pkg.module}`
  const browserEsmPath = pkg.browser[esmModulePath].replace(/^\.\//, '')
  const code = `
<!doctype html>
<html>
  <head>
    <title>Using ${pkg.name} in HTML via ESModules</title>
    <script>
      // Polyfill process.
      // **Note**: Because \`import\`s are hoisted, we need a separate, prior <script> block.
      window.process = window.process || { env: { NODE_ENV: "production" } };
    </script>
    <script type="module">
      import analytics from 'https://unpkg.com/analytics/lib/analytics.browser.es.js?module';
      import ${pkg.globalName} from 'https://unpkg.com/${pkg.name}/${browserEsmPath}?module';
      /* Initialize analytics */
      const Analytics = analytics({
        app: 'analytics-html-demo',
        debug: true,
        plugins: [
          ${exampleCode.replace(main.name, `${pkg.globalName}`)}
          // ... add any other third party analytics plugins
        ]
      })
      ${renderRelevantMethods(data)}
    </script>
  </head>
  <body>
    ....
  </body>
</html>
`

  return `<details>
  <summary>Using in HTML via ES Modules</summary>

  Using \`${pkg.name}\` in ESM modules.

  \`\`\`html
${indentString(formatCode(code, 'html'), 2)}
  \`\`\`

</details>
`
}

const storageKeys = ['setItem', 'getItem', 'removeItem']
var PLUGIN_KEYS = ['plugins', 'enable', 'load', 'disable']

const constantKeys = ['CONSTANTS', 'EVENTS']
// const anyKeyExists = (object, keys) => Object.keys(object).some((key) => keys.includes(key))

function formatName(name) {
  const prefix = 'analytics'
  if (storageKeys.includes(name)) {
    return `${prefix}.storage.${name}`
  }
  if (storageKeys.includes(name)) {
    return `${prefix}.storage.${name}`
  }
  if (PLUGIN_KEYS.includes(name)) {
    const postFix = (name === 'plugins') ? '' : `.${name}`
    return `${prefix}.plugins${postFix}`
  }
  if (constantKeys.includes(name)) {
    return `${name}`
  }
  if (name === prefix) {
    return 'Configuration'
  }
  return `${prefix}.${name}`
}

function formatExample(tags) {
  return tags.filter((tag) => {
    return tag.type === 'example'
  }).map((tag) => {
    return renderExample(tag.string)
  })
}

function formatArguments(tags) {
  const theArgs = tags.filter((tag) => {
    return tag.type === 'param'
  }).map((tag) => {
    return renderArg(tag)
  })
  // console.log('theArgs', theArgs)
  if (theArgs.length) {
    return `**Arguments**

${theArgs.join('\n')}

`
  }
  return ''
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function renderArg(tag) {
  const optionalText = (tag.name.match(/^\[/)) ? '(optional) ' : ''
  if (tag.name === '[data]') {
    // console.log('tag', tag)
  }
  let typesDescription = tag.typesDescription
  // Remove link from description
  if (tag.typesDescription.match((/<a href/))) {
    // console.log('tag.typesDescription', tag.typesDescription)
    // console.log('tag.types[0]', tag.types[0])
    const realLink = SRC_LINKS[tag.types[0]]
    // console.log('realLink', realLink)
    if (realLink) {
      typesDescription = tag.typesDescription.replace(/href="(.*?)"/, `href="${realLink}"`)
    }
  }
  return `- **${tag.name}** ${optionalText}${typesDescription} ${tag.description}`
}


function renderArgWithDoxxx(tag) {
  const optionalText = (tag.name.match(/^\[/)) ? '(optional) ' : ''
  if (tag.name === '[data]') {
    // console.log('tag', tag)
  }
  let typesDescription = tag.types.join('|')
  if (tag.types.includes('GENERIC')) {
    console.log('tag', tag)
    console.log(tag.typesDescription)
  }
  // Remove link from description
  // if (tag.typesDescription.match((/<a href/))) {
  //   // console.log('tag.typesDescription', tag.typesDescription)
  //   // console.log('tag.types[0]', tag.types[0])
  //   const realLink = SRC_LINKS[tag.types[0]]
  //   // console.log('realLink', realLink)
  //   if (realLink) {
  //     typesDescription = tag.typesDescription.replace(/href="(.*?)"/, `href="${realLink}"`)
  //   }
  // }
  return `- **${tag.name}** ${optionalText}${typesDescription} ${tag.description}`
}

function renderExample(example) {
  return `**Example**

\`\`\`js
${example.replace(/^\s+|\s+$/g, '')}
\`\`\`
`
}

const rootDir = path.join(__dirname, '..')
const markdownFiles = [
  path.join(rootDir, 'README.md'),
  path.join(rootDir, 'packages/**/**.md'),
  `!${path.join(rootDir, 'packages/**/node_modules/**/**')}`,
  `!${path.join(rootDir, 'node_modules/**/**')}`,
]
markdownMagic(markdownFiles, config, () => {
  console.log('docs done')
})
