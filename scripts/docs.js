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
        .map(pkg => ([pkg, fs.readFileSync(path.join(base, pkg, 'README.md'), 'utf8')]))
        .map(([pkg, md]) => {
          const [,, description] = md.split('\n').filter(line => line && line.length > 0)
          return `- [${pkg}](./packages/${pkg}) ${description}`
        })
        .join('\n')
      return packages
    },
    API_DOCS(content, options) {
      const fileContents = fs.readFileSync(path.join(__dirname, '..', 'packages/analytics-core/index.js'), 'utf-8')
      const docBlocs = dox.parseComments(fileContents, { raw: true, skipSingleStar: true })
      let updatedContent = ''
      docBlocs.forEach((data) => {
        // console.log('data', data)
        updatedContent += `## ${data.ctx.name}\n\n`
        updatedContent += `${data.description.full}\n\n`
        updatedContent += `${formatArguments(data.tags)}`
        updatedContent += formatExample(data.tags).join('\n')
        updatedContent += `\n`
      })
      return updatedContent.replace(/^\s+|\s+$/g, '')
    }
  }
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
    return `### Arguments

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
  return `- **${tag.name}** ${tag.typesDescription} ${tag.description}`
}

function renderExample(example) {
  return `\`\`\`js
${example.replace(/^\s+|\s+$/g, '')}
\`\`\`
`
}

const markdownPath = path.join(__dirname, '..', 'README.md')
const rootDir = path.join(__dirname, '..')
const markdownFiles = [
  path.join(rootDir, 'README.md'),
  path.join(rootDir, 'packages/**/**.md'),
  '!node_modules'
]
markdownMagic(markdownFiles, config, () => {
  console.log('docs done')
})
