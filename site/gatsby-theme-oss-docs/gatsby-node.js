const jsYaml = require('js-yaml')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const { getVersionBasePath } = require('./src/utils')

async function onCreateNode({node, actions, getNode, loadNodeContent}) {
  if (node.relativePath === 'docs/_config.yml') {
    const value = await loadNodeContent(node)
    actions.createNodeField({
      name: 'raw',
      node,
      value
    })
  }

  if (['MarkdownRemark', 'Mdx'].includes(node.internal.type)) {
    let version = 'default'
    let slug = createFilePath({
      node,
      getNode
    })

    const parent = getNode(node.parent)
    if (parent.gitRemote___NODE) {
      const gitRemote = getNode(parent.gitRemote___NODE)
      version = gitRemote.sourceInstanceName
      slug = slug.replace(/^\/docs\/source/, getVersionBasePath(version))
    }

    actions.createNodeField({
      name: 'version',
      node,
      value: version
    })

    actions.createNodeField({
      name: 'slug',
      node,
      value: slug
    })
  }
}

exports.onCreateNode = onCreateNode

function getPageFromEdge({node}) {
  return node.childMarkdownRemark || node.childMdx
}

function getSidebarContents(sidebarCategories, edges, version) {
  return Object.keys(sidebarCategories).map(key => ({
    title: key === 'null' ? null : key,
    pages: sidebarCategories[key]
      .map(linkPath => {
        const match = linkPath.match(
          /^\[([\w\s\d]+)\]\((https?:\/\/[\w./]+)\)$/
        )
        if (match) {
          return {
            anchor: true,
            title: match[1],
            path: match[2]
          }
        }

        const edge = edges.find(edge => {
          const {relativePath} = edge.node
          const {fields} = getPageFromEdge(edge)
          return (
            fields.version === version &&
            relativePath
              .slice(0, relativePath.lastIndexOf('.'))
              .replace(/^docs\/source\//, '') === linkPath
          )
        })

        if (!edge) {
          return null
        }

        const {frontmatter, fields} = getPageFromEdge(edge)
        // console.log('frontmatter', frontmatter)
        return {
          title: frontmatter.pageTitle || frontmatter.title,
          path: fields.slug
        }
      })
      .filter(Boolean)
  }))
}

const pageFragment = `
  internal {
    type
  }
  frontmatter {
    title
    pageTitle
    subTitle
  }
  fields {
    slug
    version
  }
`

const pageFragmentTwo = `
  internal {
    type
  }
  frontmatter {
    title
    pageTitle
    subTitle
  }
  fields {
    slug
    version
  }
`

exports.createPages = async ({actions, graphql}, options) => {
  const {data} = await graphql(`
    {
      allFile(filter: {extension: {in: ["md", "mdx"]}}) {
        edges {
          node {
            id
            relativePath
            childMarkdownRemark {
              ${pageFragmentTwo}
            }
            childMdx {
              ${pageFragment}
            }
          }
        }
      }
    }
  `)

  const {
    contentDir = 'site/main/source', /* change base URL */
    githubRepo,
    sidebarCategories,
    spectrumPath,
    typescriptApiBox,
    versions = {},
    defaultVersion
  } = options

  const {edges} = data.allFile
  const sidebarContents = {
    default: getSidebarContents(sidebarCategories, edges, 'default')
  }

  const versionKeys = []
  for (const version in versions) {
    versionKeys.push(version)

    // grab the old YAML config file for each older version
    const response = await graphql(`
      {
        allFile(
          filter: {
            relativePath: {eq: "docs/_config.yml"}
            gitRemote: {sourceInstanceName: {eq: "${version}"}}
          }
        ) {
          edges {
            node {
              fields {
                raw
              }
            }
          }
        }
      }
    `)

    const [{node}] = response.data.allFile.edges
    const { sidebar_categories } = jsYaml.load(node.fields.raw) // eslint-disable-line
    sidebarContents[version] = getSidebarContents(
      sidebar_categories,
      edges,
      version
    )
  }

  const [owner, repo] = githubRepo.split('/')
  const template = require.resolve('./src/components/template')
  edges.forEach(edge => {
    const {id, relativePath} = edge.node
    const {fields} = getPageFromEdge(edge)
    actions.createPage({
      path: fields.slug,
      component: template,
      context: {
        id,
        sidebarContents: sidebarContents[fields.version],
        githubUrl:
          'https://' +
          path.join(
            'github.com',
            owner,
            repo,
            'tree',
            'master',
            contentDir,
            relativePath
          ),
        spectrumPath: spectrumPath || repo,
        typescriptApiBox,
        versions: versionKeys, // only need to send version labels to client
        defaultVersion
      }
    })
  })
}
