/**
 * Generates sitemap
 */
const fs = require('fs')
const path = require('path')
const sm = require('sitemap')
const globby = require('markdown-magic').globby
const packageInfo = require('../package.json')

const distPath = path.join(__dirname, '..', 'public')
const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml')

async function makeSitemap() {
  const htmlFiles = `${distPath}/**/**.html`
  const paths = await globby([htmlFiles])
  const pages = paths.filter((file) => {
    const base = path.basename(file, '.html')
    const parent = path.basename(path.dirname(file))
    // remove 404 routes
    if (base === '404' || parent === '404') {
      return false
    }
    return true
  })
  console.log(`${pages.length} pages found`)
  const urls = pages.map((file) => {
    return {
      url: path.dirname(file.split('public')[1]),
      changefreq: 'weekly',
      priority: 0.8,
      lastmodrealtime: true,
      lastmodfile: file
    }
  })
  const options = {
    hostname: `${packageInfo.homepage}/`,
    cacheTime: 600000, // 600 sec cache period
    urls
  }
  // Creates a sitemap object given the input configuration with URLs
  const sitemap = sm.createSitemap(options)
  // Generates XML with a callback function
  sitemap.toXML((error) => {
    if (error) {
      throw error
    }
  })
  // Gives you a string containing the XML data
  const xml = sitemap.toString()
  // write sitemap to file
  fs.writeFileSync(sitemapPath, xml, 'utf-8')
  console.log('Sitemap Built!', sitemapPath)
}

makeSitemap()
