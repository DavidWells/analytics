/**
 * Wait until a given analytics provider is ready.
 * @param  {object} provider - provider object
 * @param  {[type]} timeout  - Max timeout for retries to occur
 * @param  {[type]} store    - analytics store
 * @return {Promise}
 */
export default function waitForReady(provider, timeout, store) {
  // console.log('WAIT FOR READ', provider)
  const { NAMESPACE } = provider
  const state = store.getState()
  const { loaded } = state.plugins[NAMESPACE]

  return new Promise((resolve, reject) => {
    if (loaded) {
      return resolve({ provider: provider })
    }
    // Timeout. Add to queue
    if (timeout < 1) {
      return reject({ provider: provider, queue: true }) // eslint-disable-line
    }
    // Else recursive retry
    return pause(10).then(_ => {
      return waitForReady(provider, timeout - 10, store).then(resolve, reject)
    })
  })
}

function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
