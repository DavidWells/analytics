import { isFunction } from 'analytics-utils'
import EVENTS, { nonEvents } from '../../events'
import waitForReady from '../../utils/waitForReady'
import { processQueue } from '../../utils/heartbeat'
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
      if (isFunction(callback)) {
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
        const { loaded, name } = plugin
        // 1e4 === 10000 MS
        return waitForReady(plugin, loaded, 1e4).then((d) => {
          if (!called[name]) {
            // only dispatch namespaced rdy once
            store.dispatch({
              type: EVENTS.pluginReadyType(name), // `ready:${name}`
              name: name,
              events: Object.keys(plugin).filter((name) => {
                return !nonEvents.includes(name)
              })
            })
            called[name] = true
          }
          completed = completed.concat(name)
          // It's loaded! run the command
        }).catch((e) => {
          // Timeout Add to queue
          // console.log('Error generic waitForReady. Push this to queue', e)
          if (e instanceof Error) {
            throw new Error(e)
          }
          failed = failed.concat(e.name)
          // Failed to fire, add to queue
          return e
        })
      })

      Promise.all(allCalls).then((calls) => {
        // setTimeout to ensure runs after 'page'
        setTimeout(() => {
          if (pluginsArray.length === allCalls.length) {
            store.dispatch({
              type: EVENTS.ready,
              plugins: completed,
              failed: failed
            })
          }
        }, 0)
      })
    }

    /* New plugin system */
    if (type !== EVENTS.bootstrap) {
      if (/^ready:([^:]*)$/.test(type)) {
        // Immediately flush queue
        setTimeout(() => processQueue(store, getPlugins, instance), 0)
      }
      const updated = await runPlugins(action, getPlugins, instance, store, systemEvents)
      return next(updated)
    }

    return next(updatedAction)
  }
}
