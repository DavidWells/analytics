/*
  Heartbeat retries queued events
*/
export default function heartBeat(store, getPlugins) {
  const timer = setInterval(() => {
    // console.log('____heartbeat_____')
    const pluginMethods = getPlugins()
    const { plugins, context, queue } = store.getState()
    // console.log('CURRENT Q', queue)
    const isOnline = !context.offline

    /* If network connection found and there is items in queue, process them all */
    if (isOnline && queue && queue.actions && queue.actions.length) {
      const pipeline = queue.actions.reduce((acc, item, index) => {
        const isLoaded = plugins[item.plugin].loaded
        if (isLoaded) {
          acc.process.push(item)
          acc.processIndex.push(index)
        } else {
          acc.requeue.push(item)
          acc.requeueIndex.push(index)
        }
        return acc
      }, {
        processIndex: [],
        process: [],
        requeue: [],
        requeueIndex: []
      })

      if (pipeline.processIndex && pipeline.processIndex.length) {
        pipeline.processIndex.forEach((i) => {
          const processAction = queue.actions[i]
          // console.log('RePROCESS THIS>', processAction)
          // Call methods directly right now
          const currentPlugin = processAction.plugin
          const currentMethod = processAction.payload.type
          const method = pluginMethods[currentPlugin][currentMethod]
          if (method && typeof method === 'function') {
            method({
              payload: processAction.payload,
              config: plugins[currentPlugin].config
            })

            /* Then redispatch for .on listeners / other middleware */
            store.dispatch({
              ...processAction.payload,
              type: `${currentMethod}:${currentPlugin}`,
              meta: {
                called: true,
              }
            })
          }
        })

        /* Removed processed actions */
        const reQueueActions = queue.actions.filter((value, index) => {
          return pipeline.processIndex.indexOf(index) === -1
        })

        /* Set queue actions. TODO refactor to non mutatable or move out of redux */
        queue.actions = reQueueActions
      }
    }
  }, 3000)
  return timer
}
