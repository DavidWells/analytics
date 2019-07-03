import EVENTS from '../../events'
import waitForReady from '../../utils/waitForReady'
import runPlugins from './engine'

export default function pluginMiddleware(instance, getPlugins, systemEvents) {
  const called = {}
  return store => next => async action => {
    const { type, name, callback } = action
    let updatedAction = action

    if (action.abort) {
      return next(action)
    }

    if (type === EVENTS.disablePlugin || type === EVENTS.enablePlugin) {
      // TODO run initialize if not loaded
      if (callback) {
        callback(name)
      }
    }

    if (type === EVENTS.loadPlugin) {
      // Rerun initialize calls in plugins
      const allPlugins = getPlugins()
      const pluginsToLoad = Object.keys(allPlugins).filter((name) => {
        return action.plugins.includes(name)
      }).reduce((acc, curr) => {
        acc[curr] = allPlugins[curr]
        return acc
      }, {})
      const initializeAction = {
        type: EVENTS.initializeStart,
        plugins: action.plugins
      }
      const updated = await runPlugins(initializeAction, pluginsToLoad, instance, store, systemEvents)
      return next(updated)
    }

    //*  || type.match(/^initializeAbort:/)
    if (type === EVENTS.initializeEnd) {
      const allPlugins = getPlugins()
      const pluginsArray = Object.keys(allPlugins)
      const allInitialized = pluginsArray.filter((name) => {
        return action.plugins.includes(name)
      }).map((name) => {
        return allPlugins[name]
      })
      let completed = []
      let failed = []
      const allCalls = allInitialized.map((plugin) => {
        const { loaded, NAMESPACE } = plugin
        return waitForReady(plugin, loaded, 10000).then((d) => {
          if (!called[NAMESPACE]) {
            // only dispatch namespaced rdy once
            store.dispatch({
              type: EVENTS.pluginReadyType(NAMESPACE), // `ready:${NAMESPACE}`
              name: NAMESPACE,
              events: Object.keys(plugin).filter((name) => {
                const remove = ['NAMESPACE', 'EVENTS', 'config', 'loaded']
                return !remove.includes(name)
              })
            })
            called[NAMESPACE] = true
          }
          completed = completed.concat(NAMESPACE)
          // It's loaded! run the command
        }).catch((e) => {
          // Timeout Add to queue
          // console.log('Error generic waitForReady. Push this to queue', e)
          if (e instanceof Error) {
            throw new Error(e)
          }
          failed = failed.concat(e.NAMESPACE)
          // Failed to fire, add to queue
          return e
        })
      })

      Promise.all(allCalls).then((calls) => {
        // setTimeout to ensure runs after 'page'
        setTimeout(() => {
          if (pluginsArray.length === allCalls.length) {
            store.dispatch({
              type: 'ready',
              plugins: completed,
              failed: failed
            })
          }
        }, 0)
      })
    }

    /* New plugin system */
    if (type !== 'bootstrap') {
      const updated = await runPlugins(action, getPlugins, instance, store, systemEvents)
      return next(updated)
    }

    return next(updatedAction)
  }
}
