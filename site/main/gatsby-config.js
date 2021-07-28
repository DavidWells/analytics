
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
            'tutorials/getting-started',
          ],
          Docs: [
            'api',
            'lifecycle',
            'plugins/index',
            'using-listeners',
            'debugging',
            'plugins/writing-plugins',
            'plugins/extending-plugins',
            'conditional-loading',
          ],
          Plugins: [
            'plugins/google-analytics',
            'plugins/google-tag-manager',
            'plugins/segment',
            'plugins/customerio',
            'plugins/snowplow',
            'plugins/hubspot',
            'plugins/mixpanel',
            'plugins/aws-pinpoint',
            'plugins/amplitude',
            'plugins/fullstory',
            'plugins/crazyegg',
            'plugins/gosquared',
            'plugins/simple-analytics',
            'plugins/ownstats',
            'plugins/perfumejs',
            'plugins/do-not-track',
            'plugins/tab-events',
            'plugins/window-events',
            'plugins/original-source',
            'plugins/event-validation',
            'plugins/request',
          ],
          Utilities: [
            'utils/forms',
            'utils/listeners',
            'utils/activity',
            'utils/scroll',
            'utils/router',
            'utils/storage',
            'utils/queue',
            'utils/react-hooks',
            'utils/global-storage',
            'utils/cookies',
            'utils/localstorage',
            'utils/remote-storage',
            'utils/session-storage',
            'utils/types',
          ],
          Tutorials: [
            'tutorials/getting-started',
            'tutorials/typesafe-analytics',
            'tutorials/handling-campaign-url-parameters',
            'tutorials/sending-provider-specific-events',
            'tutorials/enriching-data',
            'tutorials/using-reset',
          ],
          Resources: [
            'resources/faq',
            '[Github Repo](https://github.com/davidwells/analytics)',
          ],
        }
      }
    }
  ]
}
