/**
 * Wait until a given analytics provider is ready.
 * @param  {Object} data - passthrough resolve data
 * @param  {Function} predicate - function that resolves true
 * @param  {Number} timeout - max wait time
 * @return {Promise}
 */
export default function waitForReady(data, predicate, timeout) {
  return new Promise((resolve, reject) => {
    if (predicate()) {
      return resolve(data)
    }
    // Timeout. Add to queue
    if (timeout < 1) {
      return reject({ ...data, queue: true }) // eslint-disable-line
    }
    // Else recursive retry
    return pause(10).then(_ => {
      return waitForReady(data, predicate, timeout - 10).then(resolve, reject)
    })
  })
}

function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
