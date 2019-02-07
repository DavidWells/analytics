import EVENTS from '../../events'
import waitForReady from '../../utils/waitForReady'
import runMethod from './runMethod'
import runPlugins from './engine'

export default function pluginMiddleware(instance, getPlugins, systemEvents) {
  return store => next => action => {
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

    //*  || type.match(/^initializeAbort:/)
    if (type === EVENTS.initializeEnd) {
      const allPlugins = getPlugins()
      const allInitialized = Object.keys(allPlugins).map((name) => {
        return allPlugins[name]
      })
      let completed = []
      let failed = []
      const allCalls = allInitialized.map((plugin) => {
        const { loaded, NAMESPACE } = plugin
        return waitForReady(plugin, loaded, 10000).then((d) => {
          store.dispatch({
            type: `ready:${NAMESPACE}`, // EVENTS.pluginReadyType(NAMESPACE)
            name: NAMESPACE,
            events: Object.keys(plugin).filter((name) => {
              const remove = ['NAMESPACE', 'config', 'loaded']
              return !remove.includes(name)
            })
          })
          completed = completed.concat(NAMESPACE)
          // It's loaded! run the command
        }).catch((e) => {
          // Timeout Add to queue
          console.log('Error generic waitForReady e', e)
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
          store.dispatch({
            type: 'ready',
            plugins: completed,
            failed: failed
          })
        }, 0)
      })
    }

    if (type === EVENTS.registerPlugins) {
      const plugins = getPlugins(true)
      plugins.map((plugin, i) => { // eslint-disable-line
        const lastCall = plugins.length === (i + 1)
        /* Register plugins */
        store.dispatch({
          type: `registerPlugin:${plugin.NAMESPACE}`, // EVENTS.pluginRegisterType(NAMESPACE),
          name: plugin.NAMESPACE,
          plugin: plugin
        })

        /* All plugins registered initialize */
        if (lastCall) {
          store.dispatch({
            type: EVENTS.initializeStart,
            plugins: plugins.map((p) => {
              return p.NAMESPACE
            })
          })
        }
      })
    }
    /* New plugin system
    // if (type === 'initializeStart' || type === 'initialize') {
    const plugins = getPlugins()
    console.log('run the thing', type)
    console.time('test')
    return runMethod({
      ...action,
      ...{
        // options: {
        //   // plugins: {
        //   //   other: false
        //   // }
        // }
      }
    }, plugins, instance, store).then((d) => {
      console.log('d', d)
      const combineAction = {
        ...action,
        ...d
      }
      console.log('combineAction', combineAction)
      console.timeEnd('test')
      next(combineAction)
    })
    */

    /* Old plugin system */
    // Dyanmically run registered plugin methods
    let returnValue
    returnValue = runPlugins(
      action,
      instance,
      getPlugins(),
      store,
      systemEvents
    )
    if (returnValue && typeof returnValue === 'object') {
      // A plugin has modifed the original action
      updatedAction = returnValue
      // console.log('updatedAction', updatedAction)
    }
    /**/

    /**/

    return next(updatedAction)
  }
}
