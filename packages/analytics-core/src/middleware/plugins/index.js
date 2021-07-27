import EVENTS, { nonEvents } from '../../events'
import { runCallback, stack } from '../../utils/callback-stack'
import waitForReady from '../../utils/waitForReady'
import { processQueue } from '../../utils/heartbeat'
import runPlugins from './engine'

export default function pluginMiddleware(instance, getPlugins, systemEvents) {
  const isReady = {}
  return store => next => async action => {
    const { type, abort, plugins } = action
    let updatedAction = action

    if (abort) {
      return next(action)
    }

    /* Analytics.plugins.enable called, we need to init the plugins */
    if (type === EVENTS.enablePlugin) {
      store.dispatch({
        type: EVENTS.initializeStart,
        plugins: plugins,
        disabled: [],
        fromEnable: true,
        meta: action.meta
      })
    }
    
    if (type === EVENTS.disablePlugin) {
      // If cached callback, resolve promise/run callback. debounced to fix race condition
      setTimeout(() => runCallback(action.meta.rid, { payload: action }), 0)
    }

    /* @TODO implement
    if (type === EVENTS.loadPlugin) {
      // Rerun initialize calls in plugins
      const allPlugins = getPlugins()
      const pluginsToLoad = Object.keys(allPlugins).filter((name) => {
        return plugins.includes(name)
      }).reduce((acc, curr) => {
        acc[curr] = allPlugins[curr]
        return acc
      }, {})
      const initializeAction = {
        type: EVENTS.initializeStart,
        plugins: plugins
      }
      const updated = await runPlugins(initializeAction, pluginsToLoad, instance, store, systemEvents)
      return next(updated)
    }
    */

    //  || type.match(/^initializeAbort:/)
    if (type === EVENTS.initializeEnd) {
      const allPlugins = getPlugins()
      const pluginsArray = Object.keys(allPlugins)
      const allRegisteredPlugins = pluginsArray.filter((name) => {
        return plugins.includes(name)
      }).map((name) => {
        return allPlugins[name]
      })
      let completed = []
      let failed = []
      let disabled = action.disabled
      // console.log('allRegisteredPlugins', allRegisteredPlugins)
      const waitForPluginsToLoad = allRegisteredPlugins.map((plugin) => {
        const { loaded, name } = plugin
        /* Plugins will abort trying to load after 10 seconds. 1e4 === 10000 MS */
        return waitForReady(plugin, loaded, 1e4).then((d) => {
          if (!isReady[name]) {
            // only dispatch namespaced rdy once
            store.dispatch({
              type: EVENTS.pluginReadyType(name), // `ready:${name}`
              name: name,
              events: Object.keys(plugin).filter((name) => {
                return !nonEvents.includes(name)
              })
            })
            isReady[name] = true
          }
          completed = completed.concat(name)

          return plugin
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

      Promise.all(waitForPluginsToLoad).then((calls) => {
        // setTimeout to ensure runs after 'page'
        const payload = {
          plugins: completed,
          failed: failed,
          disabled: disabled
        }
        setTimeout(() => {
          if (pluginsArray.length === (waitForPluginsToLoad.length + disabled.length)) {
            store.dispatch({
              ...{ type: EVENTS.ready },
              ...payload,
              
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
