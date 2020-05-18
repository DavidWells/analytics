import Perfume from 'perfume.js'

/* Analytics plugin to enable perfume.js for any plugin attached to analytics */
function perfumeJsPlugin(pluginConfig = {}) {
  return {
    name: 'prefume.js',
    config: pluginConfig,
    initialize: ({ instance, config }) => {
      // Don't initialize if perfume.js not included
      if (typeof Perfume === 'undefined') return false
      const metricNames = ['fp', 'fcp', 'lcp', 'lcpFinal', 'fid', 'cls', 'clsFinal', 'tbt', 'tbt10S', 'tbtFinal']
      new Perfume({
        analyticsTracker: ({ metricName, data, navigatorInformation }) => {
          if (metricNames.includes(metricName)) {
            instance.track(metricName, {
              // Google Analytics metrics must be integers, so the value is rounded
              value: metricName === 'cls' ? data * 1000 : data,
              label: navigatorInformation.isLowEndExperience ? 'lowEndExperience' : 'highEndExperience',
              category: config.category || 'perfume.js',
              // Use a non-interaction event to avoid affecting bounce rate
              nonInteraction: true,
            })
          }
        }
      })
    }
  }
}

export default perfumeJsPlugin
