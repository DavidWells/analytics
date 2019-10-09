const { Command, flags } = require('@oclif/command')
const path = require('path')
const fs = require('fs')
const markdownMagic = require('markdown-magic')
const prettier = require('prettier')
const dox = require('dox')

class DocsCommand extends Command {
  async run() {
    const markdownFiles = [
      path.join(process.cwd(), 'README.md'),
      '!node_modules'
    ]
    markdownMagic(markdownFiles, config, () => {
      console.log(`Analytics documentation updated ${process.cwd()}`)
    })
  }
}

DocsCommand.description = `Generate Analytic plugin documentation`

module.exports = DocsCommand

var config = {
  matchWord: 'ANALYTICS_DOCS',
  transforms: {
    API(content, options, context) {
      let updatedContent = ''
      const opts = options || {}
      const basePath = path.dirname(context.originalPath)
      const browserPath = opts.browser || path.join(basePath, 'src/browser.js')
      const nodePath = opts.node || path.join(basePath, 'src/node.js')

      if (browserPath && fs.existsSync(browserPath)) {
        const fileContents = fs.readFileSync(browserPath, 'utf-8')
        const docBlocs = dox.parseComments(fileContents, { raw: true, skipSingleStar: true })
        docBlocs.forEach((data) => {
          // console.log('data', data)
          // updatedContent += `### ${data.ctx.name}\n\n`
          updatedContent += `## Plugin Options\n\n`
          // updatedContent += `${data.description.full}\n\n`
          updatedContent += `${formatArguments(data.tags)}`
          updatedContent += formatExample(data.tags).join('\n')
          updatedContent += `\n`
        })
      }
      return updatedContent.replace(/^\s+|\s+$/g, '')
    },
    USAGE(content, options, context) {
      let updatedContent = ''
      const opts = options || {}
      const basePath = path.dirname(context.originalPath)
      const browserPath = opts.browser || path.join(basePath, 'src/browser.js')
      const nodePath = opts.node || path.join(basePath, 'src/node.js')
      const packageJson = fs.readFileSync(path.join(basePath, 'package.json'), 'utf-8')
      const pkg = JSON.parse(packageJson)

      if (browserPath && fs.existsSync(browserPath)) {
        const fileContents = fs.readFileSync(browserPath, 'utf-8')
        const docBlocs = dox.parseComments(fileContents, { raw: true, skipSingleStar: true })

        docBlocs.forEach((data) => {
          const example = data.tags.filter((tag) => {
            return tag.type === 'example'
          }).map((tag) => {
            return tag.string
          })
          if (example && example[0]) {
            updatedContent += renderUsageExample(example[0], data.ctx.name, pkg.name)
            updatedContent += `\n`
          }
        })
      }

      return updatedContent.replace(/^\s+|\s+$/g, '')
    },
    METHODZ(content, options, context) {
      let updatedContent = ''
      const opts = options || {}
      const basePath = path.dirname(context.originalPath)
      const browserPath = opts.browser || path.join(basePath, 'src/browser.js')
      const nodePath = opts.node || path.join(basePath, 'src/node.js')
      const packageJson = fs.readFileSync(path.join(basePath, 'package.json'), 'utf-8')
      const pkg = JSON.parse(packageJson)

      // TODO parse AST and get available methods
      const lib = require(path.resolve(pkg.main))

      if (typeof lib === 'function') {
        const string = lib.toString()
        // console.log('string', string)

        // const methods = lib()
        // console.log('methods', methods)
      }
      // console.log('lib', lib)
      return updatedContent
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
    return `**Arguments**

${theArgs.join('\n')}

`
  }
  return ''
}

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

function renderUsageExample(example, name, pkg) {
  const code = `
import Analytics from 'analytics'
import ${name} from '${pkg}'

const analytics = Analytics({
  app: 'awesome-app',
  plugins: [
    ${example.replace(/^\s+|\s+$/g, '')},
    // ...other plugins
  ]
})

/* Track page views */
analytics.page()

/* Track custom events */
analytics.track('buttonClicked')

/* Identify visitors */
analytics.identify('user-xzy-123', {
  name: 'Bill Murray',
  cool: true
})
`
  const formattedCode = prettier.format(code, { semi: false, singleQuote: true, parser: 'babel' })

  return `## Usage

Install \`analytics\` and \`${pkg}\` packages

\`\`\`bash
npm install analytics ${pkg}
\`\`\`

Import and initialize in project

\`\`\`js
${formattedCode}
\`\`\``
}
