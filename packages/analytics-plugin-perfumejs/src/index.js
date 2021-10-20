/**
 * Perfume.js plugin
 * @link https://zizzamia.github.io/perfume/
 * @link https://www.npmjs.com/package/perfume.js
 * @param {object|function} pluginConfig - Plugin settings or zero config perfume.js instance
 * @param {object} [pluginConfig.perfume] - perfume.js class. If not provided, a global window reference to Perfume will be used
 * @param {object} [pluginConfig.destinations] - Where perfume.js will send performance data
 * @param {string} [pluginConfig.category = perfume.js] - Name of event category. Default 'perfume.js'
 * @param {object} [pluginConfig.perfumeOptions] - Options to pass to perfume.js instance. See https://github.com/Zizzamia/perfume.js#perfume-custom-options
 * @return {*}
 * @example
 *
 * perfumeJsPlugin({
 *   perfume: Perfume,
 *   destinations: { all: true },
 *   category: 'perfMetrics',
 * })
 */
function perfumeJsPlugin(pluginConfig = {}) {
  const conf = (typeof pluginConfig !== 'function') ? pluginConfig : {
    perfume: pluginConfig
  }
  return {
    name: 'perfume.js',
    config: conf,
    initialize: ({ instance, config }) => {
      const { perfume, destinations, metricNames = metrics } = config
      const perfumeOptions = config.perfumeOptions || {}
      const PerfumeInstance = (typeof Perfume !== 'undefined') ? Perfume : perfume
      // Don't initialize if perfume.js not included
      if (!PerfumeInstance) {
        throw new Error('Perfume.js not found. Verify it is passed into analytics plugin as "perfume" config or set is on window')
        return false
      }

      /* Where data should send */
      const dataSinks = (!destinations) ? { all: true } : destinations
      /* Initialize perfume.js tracker */
      new PerfumeInstance({
        analyticsTracker: ({
          metricName,
          data,
          navigatorInformation
        }) => {
          if (metricNames.includes(metricName)) {
            instance.track(metricName, {
              // Google Analytics metrics must be integers, so the value is rounded
              value: metricName === 'cls' ? data * 1000 : data,
              label: navigatorInformation.isLowEndExperience ? 'lowEndExperience' : 'highEndExperience',
              category: config.category || 'perfume.js',
              // Use a non-interaction event to avoid affecting bounce rate
              nonInteraction: true,
            }, {
              plugins: dataSinks
            })
          }
        },
        ...perfumeOptions
      })
    }
  }
}

/* See https://github.com/Zizzamia/perfume.js#performance-audits */
export const metrics = [
  'fp', // firstPaint
  'fcp', // firstContentfulPaint
  'lcp', // largestContentfulPaint
  'lcpFinal', // largestContentfulPaintFinal
  'fid', // firstInputDelay
  'cls', // cumulativeLayoutShift
  'clsFinal', // cumulativeLayoutShiftFinal
  'tbt', // totalBlockingTime
  'tbt10S', // totalBlockingTime10S
  'tbtFinal' // totalBlockingTimeFinal
];

export default perfumeJsPlugin
