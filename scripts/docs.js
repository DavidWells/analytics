const path = require('path')
const fs = require('fs')
const markdownMagic = require('markdown-magic')
const dox = require('dox')

const config = {
  transforms: {
    // https://github.com/moleculerjs/moleculer-addons/blob/master/readme-generator.js#L11
    PACKAGES(content, options) {
      const base = path.resolve('packages')
      const packages = fs.readdirSync(path.resolve('packages'))
        .filter(pkg => !/^\./.test(pkg))
        .map(pkg => ([pkg, fs.readFileSync(path.join(base, pkg, 'package.json'), 'utf8')]))
        .map(([pkg, json]) => {
          console.log('json', json)
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
        .map(([pkg, json]) => {
          const { name, description } = JSON.parse(json)
          return `- [${name}](https://github.com/DavidWells/analytics/tree/master/packages/${pkg}) ${description} [npm link](https://www.npmjs.com/package/${name}).`
        }).concat('- Add yours! 👇')
        .join('\n')
      return packages
    },
    API_DOCS(content, options) {
      const fileContents = fs.readFileSync(path.join(__dirname, '..', 'packages/analytics-core/src/index.js'), 'utf-8')
      const docBlocs = dox.parseComments(fileContents, { raw: true, skipSingleStar: true })
      let updatedContent = ''
      docBlocs.forEach((data) => {
        // console.log('data', data)
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
      })
      return updatedContent.replace(/^\s+|\s+$/g, '')
    }
  }
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
function renderArg(tag) {
  const optionalText = (tag.name.match(/^\[/)) ? '(optional) ' : ''
  return `- **${tag.name}** ${optionalText}${tag.typesDescription} ${tag.description}`
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
