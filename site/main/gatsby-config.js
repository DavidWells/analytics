
module.exports = {
  pathPrefix: '/',
  __experimentalThemes: [
    {
      resolve: 'gatsby-theme-oss-docs',
      options: {
        root: __dirname,
        subtitle: 'npm install analytics',
        description: 'How to use the analytics npm module',
        githubRepo: 'davidwells/analytics',
        spectrumPath: 'analytics',
        sidebarCategories: {
          null: [
            'index',
            'intro/installation',
          ],
          Docs: [
            'api',
            'using-plugins',
            'using-listeners',
          ],
          Plugins: [
            'plugins/google-analytics',
            'plugins/google-tag-manager',
            'plugins/segment',
            'plugins/customerio',
            'plugins/crazyegg',
            'plugins/do-not-track',
            'plugins/tab-events',
            'plugins/window-events',
            'plugins/original-source',
          ],
          Tutorial: [
            'tutorial/introduction',
            // 'tutorial/whats-next'
          ],
          Resources: [
            '[Github Repo](https://github.com/davidwells/analytics)',
            'resources/faq'
          ],
        }
      }
    }
  ]
}
