const path = require('path')
const fs = require('fs-extra')
const globby = require('markdown-magic').globby

const PACKAGE_PATH = path.join(__dirname, '../packages')
const DOC_PATH = path.join(__dirname, 'main/source')
const PLUGIN_DOC_PATH = path.join(DOC_PATH, 'plugins')
const UTILS_DOC_PATH = path.join(DOC_PATH, 'utils')

function resolve(name) {
  return path.join(PLUGIN_DOC_PATH, name)
}

const CUSTOM_MAPPING = {
  '@analytics/crazy-egg': resolve('crazyegg.md'),
  'use-analytics': path.resolve(UTILS_DOC_PATH, 'react-hooks.md'),
  '@analytics/listener-utils': path.resolve(UTILS_DOC_PATH, 'listeners.md'),
  '@analytics/activity-utils': path.resolve(UTILS_DOC_PATH, 'activity.md'),
  '@analytics/scroll-utils': path.resolve(UTILS_DOC_PATH, 'scroll.md'),
  '@analytics/form-utils': path.resolve(UTILS_DOC_PATH, 'forms.md'),
  '@analytics/cookie-utils': path.resolve(UTILS_DOC_PATH, 'cookies.md'),
  '@analytics/router-utils': path.resolve(UTILS_DOC_PATH, 'router.md'),
  '@analytics/storage-utils': path.resolve(UTILS_DOC_PATH, 'storage.md'),
  '@analytics/remote-storage-utils': path.resolve(UTILS_DOC_PATH, 'remote-storage.md'),
  '@analytics/localstorage-utils': path.resolve(UTILS_DOC_PATH, 'localstorage.md'),
  '@analytics/global-storage-utils': path.resolve(UTILS_DOC_PATH, 'global-storage.md'),
  '@analytics/queue-utils': path.resolve(UTILS_DOC_PATH, 'queue.md'),
  '@analytics/type-utils': path.resolve(UTILS_DOC_PATH, 'types.md'),
  '@analytics/session-storage-utils': path.resolve(UTILS_DOC_PATH, 'session-storage.md'),
}

async function getFiles() {
  const topLevelPackages = [`${PACKAGE_PATH}/*/package.json`]
  const files = await globby(topLevelPackages)
  const collectInfo = files.map(async (file) => {
    const pkg = require(file)
    const slug = pkg.name.replace(/^@analytics\//, '')
    const directory = path.dirname(file)
    const docFilePath = path.join(PLUGIN_DOC_PATH, `${slug}.md`)
    const exists = await fileExists(docFilePath)
    return {
      pkg: pkg,
      dir: directory,
      exists: exists,
      repoMdPath: path.resolve(directory, 'README.md'),
      docPath: CUSTOM_MAPPING[pkg.name] || docFilePath
    }
  })

  const fileData = await Promise.all(collectInfo)

  return fileData.filter((info) => {
    return CUSTOM_MAPPING[info.pkg.name] || info.exists
  })
}

async function updateContents(file, docsPath) {
  const content = await fs.readFile(file, 'utf-8')
  // Only sync content with frontmatter
  if (content.startsWith('<!--')) {
    const newContent = formatContent(content)
    await fs.writeFile(docsPath, newContent)
    console.log(`Docs synced to ${docsPath}`)
  }
}

async function syncDocs() {
  const files = await getFiles()
  // console.log('files', files)
  const promises = files.map((file) => {
    return updateContents(file.repoMdPath, file.docPath)
  })
  await Promise.all(promises)
}

function formatContent(content) {
  const removeContentRegex = /<!--.*stripFromDocsSTART((.|\n)*?END.*-->)/g
  const mdMagicRegex = /<!--.*AUTO-GENERATED-CONTENT:START((.|\n)*?END.*-->)/g

  return content
    // Remove first h1
    .replace(/^#(.*)/m, '')
    // remove blocks
    .replace(removeContentRegex, '')
    // remove redudant view docs link
    .replace(/\[View the docs\]\(.*\)\.?/, '')
    .replace(/For more information \[see the docs\]\(.*\)\.?/, '')
    // remove md magic blocks
    // .replace(mdMagicRegex, '')
    .replace('<!--', '---')
    .replace('-->', '---')
    // Replace multiple blank lines
    .replace(/^\s*\n/gm, '\n')
}

function removeGithubSpecificContent(content) {
  const docLinkRegex = /<!--.*stripFromDocsSTART((.|\n)*?END.*-->)/g
  return content.replace(docLinkRegex, '')
}

function fileExists(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.F_OK, (err) => {
      if (err) {
        // console.log(`${consolePrefix} No ${filePath} found. Proceeding`)
        return resolve(false) // eslint-disable-line
      }
      return resolve(true)
    })
  })
}

syncDocs()
