const path = require('path')
const fs = require('fs')
const { inspect } = require('util')
const markdownMagic = require('markdown-magic')
const dox = require('dox')
const outdent = require('outdent')
const prettier = require('prettier')
const getPluginDetails = require('./docs/get-plugin-details')
const indentString = require('indent-string')
// Force sync processing until markdown-magic 2.0 is released

function deepLog(data) {
  console.log(inspect(data, {showHidden: false, depth: null, colors: true}))
}

const SRC_LINKS = {
  PageData: 'https://github.com/DavidWells/analytics/blob/master/packages/analytics-core/src/modules/page.js#L33',
  track: 'https://getanalytics.io/api/#analyticstrack',
  page: 'https://getanalytics.io/api/#analyticspage',
  identify: 'https://getanalytics.io/api/#analyticsidentify',
  reset: 'https://getanalytics.io/api/#analyticsreset'
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
    PLUGINS(content, options) {
      const base = path.resolve('packages')
      const packages = fs.readdirSync(path.resolve('packages'))
        .filter(pkg => !/^\./.test(pkg))
        .filter(pkg => pkg !== 'analytics-core')
        .map(pkg => ([pkg, fs.readFileSync(path.join(base, pkg, 'package.json'), 'utf8')]))
        .filter(([pkg, json]) => {
          const parsed = JSON.parse(json)
          return parsed.private !== true
        })
        .map(([pkg, json]) => {
          const { name, description } = JSON.parse(json)
          return `- [${name}](https://github.com/DavidWells/analytics/tree/master/packages/${pkg}) ${description} [npm link](https://www.npmjs.com/package/${name}).`
        }).concat('- Add yours! 👇')
        .join('\n')
      return packages
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
        // updatedContent += `### ${formatName(data.ctx.name)}\n\n`
        // updatedContent += `${data.description.full}\n\n`
        // updatedContent += `${formatArguments(data.tags)}`
        // updatedContent += formatExample(data.tags).join('\n')
        // updatedContent += `\n`
      })
      return md.replace(/^\s+|\s+$/g, '')
    },
    // https://flaviocopes.com/how-to-get-last-updated-date-file-node/
    LAST_MODIFIED(content, options, instance) {
      const getFileUpdatedDate = (path) => {
        const stats = fs.statSync(path)
        return stats.mtime
      }
      console.log('instance', instance)
      const date = getFileUpdatedDate(instance.originalPath)
      return date
    },
    PLUGIN_PLATFORMS_SUPPORTED(content, options, instance) {
      let updatedContent = ''
      const { originalPath } = instance
      let data
      if (cache[originalPath]) {
        data = cache[originalPath]
      } else {
        data = getPluginDetails(originalPath)
        cache[originalPath] = data
      }
      if (data) {
        const platforms = getPlatforms(data).join(' and ')
        return outdent`
        ## Platforms Supported

        ${platforms}
        `
      }
    },
    PLUGIN_DOCS(content, options, instance) {
      let updatedContent = ''
      let exampleText = ''
      let data
      const { originalPath } = instance
      if (cache[originalPath]) {
        data = cache[originalPath]
      } else {
        data = getPluginDetails(originalPath)
        cache[originalPath] = data
      }
      if (data && data.length) {
        // deepLog(data)

        const examples = data.reduce((acc, d) => {
          acc = acc.concat(renderUsage(d, data))
          return acc
        }, [])
          .sort(sortUsageExamples)
          .map((ex) => ex.text)
          .join('\n')

        exampleText = examples
        /* Supported platforms */
        const platforms = data.map((d) => {
          let methods = ''
          if (d.data.ast.methodsAndValues) {
            methods = d.data.ast.methodsAndValues
              .filter(x => removeMethod(x.name))
              .map((x) => {
                return `\`${x.name}\``
              }).join(', ')
          }
          const plat = (d.platform === 'node') ? 'node.js' : d.platform
          return outdent`
          ### ${capitalizeFirstLetter(plat)} Methods
          ${methods}\n
          `
        }).join('\n')
        // console.log('platforms', platforms)
        updatedContent += platforms
      }
      return `${exampleText}`
    },
    API_DOCS(content, options) {
      const fileContents = fs.readFileSync(path.join(__dirname, '..', 'packages/analytics-core/src/index.js'), 'utf-8')
      const docBlocs = dox.parseComments(fileContents, { raw: true, skipSingleStar: true })
      let updatedContent = ''
      const removeItems = ['analytics.instance', 'analytics.return']
      docBlocs.forEach((data) => {
        // console.log('data', data)
        const niceName = formatName(data.ctx.name)
        if (!removeItems.includes(niceName)) {
          updatedContent += `### ${formatName(data.ctx.name)}\n\n`
          updatedContent += `${data.description.full}\n\n`
          updatedContent += `${formatArguments(data.tags)}`
          /*
          <details>
            <summary>usage example</summary>

            ```js
            const la = 'foo'
            ```

          </details>
           */
          updatedContent += formatExample(data.tags).join('\n')
          updatedContent += `\n`
        }
      })
      return updatedContent.replace(/^\s+|\s+$/g, '')
    }
  }
}

function formatCode(code, type = 'babel') {
  return prettier.format(code, { semi: false, singleQuote: true, parser: type })
}

const removeList = ['NAMESPACE', 'config', 'loaded', 'initialize']
function removeMethod(name) {
  return !removeList.includes(name)
}

function sortUsageExamples(a, b) {
  if (a.order < b.order) return -1
  if (a.order > b.order) return 1
  return 0
}

function renderUsage(d, allData) {
  const { data, pkg, platform } = d
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
    const vanillaHtml = browserStandaloneUsage(data, pkg)

    return [{
      name: 'main',
      order: 0,
      text: mainUsageBlock(data, pkg, allData)
    }, {
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

function renderJsDocs(data) {
  let updatedContent = ''
  const defaultExport = data.ast.foundExports.find((x) => Boolean(x.isDefault))
  console.log('defaultExport', defaultExport)
  console.log('data.jsdocs', data.jsdoc)
  const jsDocForDefaultExport = data.jsdoc.find((x) => x.id === defaultExport.name)
  console.log('Docs to use', jsDocForDefaultExport)
  return updatedContent
  updatedContent += `${formatArguments(data.tags)}`
  updatedContent += formatExample(data.tags).join('\n')
  updatedContent += `\n`
  return
}

function mainUsageBlock(data, pkg, allData) {
  console.log('allData', allData)
  const platforms = getPlatforms(allData)
  console.log('platforms', platforms)
  const main = data.jsdoc.find((doc) => Boolean(doc.examples))

  const name = main.name
  const exampleCode = main.examples[0]
  const code = `
import Analytics from 'analytics'
import ${name} from '${pkg.name}'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    ${exampleCode}
  ]
})

${renderRelevantMethods(data)}
`

  const what = allData.map((y) => {
    const name = getPlatformName(y)
    const exp = getExposedFunctions(y.data)
    const jsDoc = renderJsDocs(y.data)
    const niceName = (name === 'node.js') ? `Server-side` : name
    const niceText = (name === 'node.js') ? `${niceName} ${capitalizeFirstLetter(name)}` : niceName
    return `### ${capitalizeFirstLetter(niceName)}

The ${niceText} side plugin works with these [analytics api methods](https://getanalytics.io/api/)

${exp.map((x) => {
    const link = SRC_LINKS[x]
    const linkText = (link) ? `[${x}](${link})` : x
    return linkText
}).join(', ')}

API Docs here
`
  })

return `
## Usage

The \`${pkg.name}\` package works in ${platforms.join(' and ')}

Below is an example of the browser side plugin

\`\`\`js
${indentString(formatCode(code), 0)}
\`\`\`

${what.join('\n')}
`
}
// ${example.replace(/^\s+|\s+$/g, '')},
function es6Usage(data, pkg) {
  const main = data.jsdoc.find((doc) => Boolean(doc.examples))

  const name = main.name
  const exampleCode = main.examples[0]
  const code = `
import Analytics from 'analytics'
import ${name} from '${pkg.name}'

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
  <summary>Serverside ES6</summary>

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
  const exposedFunctions = getExposedFunctions(data)
  console.log('methods', exposedFunctions)
  let page = ''
  if (exposedFunctions.includes('page')) {
    page = `
    /* Track a page view */
    analytics.page()`
  }
  let track = ''
  if (exposedFunctions.includes('track')) {
    track = `
    /* Track a custom event */
    analytics.track('cartCheckout', {
      price: 20,
      item: 'pink socks'
    })`
  }

  let identify = ''
  if (exposedFunctions.includes('identify')) {
    identify = `
    /* Identify a visitor */
    analytics.identify('user-id-xyz', {
      firstName: 'bill',
      lastName: 'murray',
    })`
  }

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
  <summary>Node.js common JS</summary>

  \`\`\`js
${indentString(formatCode(code), 2)}
  \`\`\`

</details>
`
}

function browserStandaloneUsage(data, pkg) {
  // Find doc block with example (should only be one the main function)
  const main = data.jsdoc.find((doc) => Boolean(doc.examples))

  const exampleCode = main.examples[0]

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
          ${exampleCode.replace(main.name, `${pkg.globalName}.init`)}
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

  Using \`${pkg.name}\` in ESM(odules).

  \`\`\`html
${indentString(formatCode(code, 'html'), 2)}
  \`\`\`

</details>
`
}

const storageKeys = ['setItem', 'getItem', 'removeItem']
const constantKeys = ['CONSTANTS', 'EVENTS']
// const anyKeyExists = (object, keys) => Object.keys(object).some((key) => keys.includes(key))

function formatName(name) {
  const prefix = 'analytics'
  if (storageKeys.includes(name)) {
    return `${prefix}.storage.${name}`
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
/*
{
  type: 'param',
  string: '{String} namespace - integration namespace',
  name: 'namespace',
  description: '- integration namespace',
  types: [Array],
  typesDescription: '<code>String</code>',
  optional: false,
  nullable: false,
  nonNullable: false,
  variable: false
}
*/

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function renderArg(tag) {
  const optionalText = (tag.name.match(/^\[/)) ? '(optional) ' : ''
  if (tag.name === '[data]') {
    console.log('tag', tag)
  }
  let typesDescription = tag.typesDescription
  // Remove link from description
  if (tag.typesDescription.match((/^<a/))) {
    const realLink = SRC_LINKS[tag.types[0]]
    if (realLink) {
      typesDescription = tag.typesDescription.replace(/href="(.*?)"/, `href="${realLink}"`)
    }
  }
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
  path.join(rootDir, 'packages/**/**.md'),
  `!${path.join(rootDir, 'packages/**/node_modules/**/**.md')}`,
  '!node_modules'
]
markdownMagic(markdownFiles, config, () => {
  console.log('docs done')
})
