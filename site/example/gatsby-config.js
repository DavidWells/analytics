
module.exports = {
  pathPrefix: '/',
  __experimentalThemes: [
    {
      resolve: 'gatsby-theme-apollo-docs',
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
          ],
          Plugins: [
            'plugins/google-analytics',
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
