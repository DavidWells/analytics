const path = require('path')
const fs = require('fs')
const { inspect } = require('util')
const markdownMagic = require('markdown-magic')
const dox = require('dox')
const outdent = require('outdent')
const forceSync = require('sync-rpc')
// Force sync processing until markdown-magic 2.0 is released
const getPluginInfo = forceSync(require.resolve('./docs/parseSync'))

function deepLog(data) {
  console.log(inspect(data, {showHidden: false, depth: null, colors: true}))
}

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
      // const date = getFileUpdatedDate()
      return 'lol'
    },
    PLUGIN_PLATFORMS_SUPPORTED(content, options, instance) {
      let updatedContent = ''
      const data = grabPluginData(instance.originalPath)
      if (data) {
        const platforms = data.map((d) => {
          const plat = (d.platform === 'node') ? 'node.js' : d.platform
          return capitalizeFirstLetter(plat)
        }).join(' and ')
        return outdent`
        ## Platforms Supported

        ${platforms}
        `
      }
    },
    PLUGIN_DOCS(content, options, instance) {
      let updatedContent = ''
      const data = grabPluginData(instance.originalPath)
      if (data) {
        deepLog(data)
        const removeList = ['NAMESPACE', 'config', 'loaded', 'initialize']
        /* Supported platforms */
        const platforms = data.map((d) => {
          let methods = ''
          if (d.data.ast.methodsAndValues) {
            methods = d.data.ast.methodsAndValues
              .filter(x => !removeList.includes(x.name))
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
        console.log('platforms', platforms)
        updatedContent += platforms
      }
      return updatedContent
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

function grabPluginData(originalPath) {
  const dir = path.dirname(originalPath)
  const SRC_DIR = path.resolve(dir, 'src')
  const PKG_DIR = path.join(dir, 'package.json')
  const pkg = require(PKG_DIR)
  if (pkg && pkg.projectMeta) {
    if (pkg.projectMeta.platforms) {
      return Object.keys(pkg.projectMeta.platforms).map((platform) => {
        const entryPath = pkg.projectMeta.platforms[platform]
        const resolvedEntryPath = path.resolve(dir, entryPath)
        return {
          platform: platform,
          data: getPluginInfo(resolvedEntryPath)
        }
      })
    }
  }
  return {}
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

const SRC_LINKS = {
  PageData: 'https://github.com/DavidWells/analytics/blob/master/packages/analytics-core/src/modules/page.js#L33'
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
