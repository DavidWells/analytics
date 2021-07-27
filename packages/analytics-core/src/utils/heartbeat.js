import { isFunction } from '@analytics/type-utils'
import { ID, ANONID } from './internalConstants'

export function processQueue(store, getPlugins, instance) {
  const pluginMethods = getPlugins()
  const { plugins, context, queue, user } = store.getState()
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
        if (method && isFunction(method)) {
          /* enrich queued payload with userId / anon id if missing */
          /* TODO hoist enrich into where action queued? */
          // console.log('before', processAction.payload)
          const enrichedPayload = enrich(processAction.payload, user)
          // console.log('user.userId', user.userId)
          // console.log('user.anonymousId', user.anonymousId)
          // console.log('after enrich', enrichedPayload)
          method({
            payload: enrichedPayload,
            config: plugins[currentPlugin].config,
            instance,
          })

          /* Then redispatch for .on listeners / other middleware */
          const pluginEvent = `${currentMethod}:${currentPlugin}`
          store.dispatch({
            ...enrichedPayload,
            type: pluginEvent,
            /* Internal data for analytics engine */
            _: {
              called: pluginEvent,
              from: 'queueDrain'
            }
          })
        }
      })

      /* Removed processed actions */
      const reQueueActions = queue.actions.filter((value, index) => {
        // note !~ === return pipeline.processIndex.indexOf(index) === -1
        return !~pipeline.processIndex.indexOf(index)
      })

      /* Set queue actions. TODO refactor to non mutatable or move out of redux */
      queue.actions = reQueueActions
    }
  }
}

/* Heartbeat retries queued events */
export default function heartBeat(store, getPlugins, instance) {
  // 3e3 === 3000 ms
  return setInterval(() => processQueue(store, getPlugins, instance), 3e3)
}

// Assign userId && anonymousId values if present in payload but null
function enrich(payload = {}, user = {}) {
  return [ ID, ANONID ].reduce((acc, key) => {
    if (payload.hasOwnProperty(key) && user[key] && (user[key] !== payload[key])) {
      // console.log(`${key} stale update with ${user[key]}`)
      acc[key] = user[key]
    }
    return acc
  }, payload)
}
