import EVENTS, { nonEvents } from '../../events'
import { runCallback, stack } from '../../utils/callback-stack'
import waitForReady from '../../utils/waitForReady'
import { processQueue } from '../../utils/heartbeat'
import runPlugins from './engine'

export default function pluginMiddleware(instance, getPlugins, systemEvents) {
  const isReady = {}
  return store => next => async action => {
    const { type, abort, readyCalled, plugins } = action
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

    if (type === EVENTS.loadPlugin) {
      const pluginsToLoad = getPlugins(plugins)
      const initializeAction = {
        type: EVENTS.initializeStart,
        plugins: plugins,
        fromEnable: true,
      }
      console.log('initializeAction', initializeAction)
      const updated = await runPlugins(initializeAction, pluginsToLoad, instance, store, systemEvents)
      return next(updated)
    }

    //  || type.match(/^initializeAbort:/)
    if (type === EVENTS.initializeEnd) {
      const enabledPlugins = getPlugins(plugins, true)
      console.log('enabledPlugins', enabledPlugins)
      let completed = []
      let failed = []
      let disabled = action.disabled
      // console.log('allEnabledPlugins', allEnabledPlugins)
      const waitForPluginsToLoad = enabledPlugins.map((plugin) => {
        const { loaded, name, config } = plugin
        const loadedFn = () => loaded({ config }) // @TODO add in more to api to match other funcs?
        /* Plugins will abort trying to load after 10 seconds. 1e4 === 10000 MS */
        return waitForReady(plugin, loadedFn, 1e4).then((d) => {
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
        setTimeout(() => {
          if (!readyCalled && enabledPlugins.length === waitForPluginsToLoad.length) {
            store.dispatch({
              type: EVENTS.ready,
              plugins: completed,
              failed: failed,
              disabled: disabled
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
