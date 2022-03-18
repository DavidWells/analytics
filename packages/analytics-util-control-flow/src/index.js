
const noOp = () => true

/**
 * Run function once
 * @param {Function} fn - Function to run just once
 * @param {*} [context] - Extend function context
 * @returns 
 */
export function once(fn, context) {
  var result
  return function() {
    if (fn) {
      result = fn.apply(context || this, arguments)
      fn = null
    }
    return result
  }
}

/**
 * Add async delay
 * @param {number} ms 
 * @returns {Promise}
 * @example
 * await delay(1000)
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * @template {Function} F;
 * @param {F} func;
 * @param {number} wait;
 * @return {F};
 */
export function throttle(func, wait) {
  var context, args, result
  var timeout = null
  var previous = 0
  var later = function () {
    previous = new Date()
    timeout = null
    result = func.apply(context, args)
  };
  return function () {
    var now = new Date()
    if (!previous) {
      previous = now
    }
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0) {
      clearTimeout(timeout)
      timeout = null
      previous = now
      result = func.apply(context, args)
    } else if (!timeout) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

/**
 * Tick a function on a scehdule
 * @param {*} fn - Function to execute
 * @param {number} tick - Delay in milliseconds
 * @returns 
 */
export function heartBeat(fn, tick = 3e3) {
  const id = setInterval(() => fn(), tick)
  return () => {
    clearInterval(id)
    return () => heartBeat(fn, tick)
  }
}

/**
 * waitFor predicate to resolve to true
 * @param {*} param0 
 */
export function waitFor({
  predicate = noOp,
  onSuccess = noOp,
  onFailure = noOp,
  timeout = 10e3, // 10 sec
  interval = 50,
  elapsed = 0,
}) {
  setTimeout(async () => {
    try {
      const done = await predicate()
      if (done) return onSuccess(done, elapsed)
    } catch (err) {
      return onFailure(err)
    }
    if (elapsed >= timeout) return onFailure('timeout')
    waitFor({ predicate, onSuccess, onFailure, timeout, elapsed: elapsed + interval })
  }, interval)
}


/**
 * Fast loop over array of items
 * @param {Array[*]} arr 
 * @param {fn} logic 
 */
function loop(arr = [], logic) {
  for (let i = 0; i < arr.length; i++) logic(arr[i], i)
}

function has(arr, item) {
  return arr.indexOf(item) > -1
}

const DOT = '.'
const STAR = '*'

/**
 * Get all possible path matches from key
 * @param {*} key 
 * @param {*} _cache 
 * @returns {Array<string>}
 */
export function getWildCards(key, _cache = {}) {
  let paths = ''
  if (_cache[key]) return _cache[key]
  const parts = key.split(DOT)
  const hasStar = key.indexOf(STAR) > -1
  const hasDotStar = hasStar && key.charAt(key.length - 2) === DOT
  const wildCards = [STAR, key] // Match * and key by default
  /* Add prefix */
  if (hasStar && !hasDotStar) {
    wildCards.push(key.slice(0, key.length -1))
  }
  for (let x = 0; x < parts.length; x++) {
    const notLast = parts.length !== x + 1
    const ending = (hasStar && !notLast) ? '' : STAR
    paths = paths + (x ? DOT : '') + parts[x]
    /* If not last item, compose wildcards from path */
    const one = paths + DOT + ending
    if (notLast && !has(wildCards, one)) wildCards.push(one)
    /* Has star & ends with dot .* */
    const two = paths + ending
    if (!hasDotStar && !has(wildCards, two)) wildCards.push(two)
  }
  return _cache[key] = wildCards
}

/**
 * Tiny lil event mitter with wildcard support
 * @returns 
 * @example
  const events = eventEmitter()
  // Subscribe
  events.on("cool", (d) => console.log("cool", d))
  events.on("cool.awesome", (d) => console.log("cool.awesome fired", d))
  events.on("cool.awesome.rad", (d) => console.log("cool.awesome.rad fired", d))
  // Emit
  events.emit('cool', { data: 'hello' })
  events.emit('cool.awesome', { data: 'hello' })
  events.emit('cool*', { data: 'hello' })
  events.emit('cool.*', { data: 'hello' })
  // Unsubscribe
  events.off('cool')
  events.off("cool.awesome")
  events.off("cool*")
  events.off("cool.*")
 */
export function eventEmitter() {
  let all = {}
  let cache = {}
  
  function on(name, handler) {
    all[name] = all[name] || []
    all[name].push(handler)
    cache[name] = getWildCards(name, cache)
    return () => off(name, handler)
  }

  function off(name, handler) {
    loop(getEvents(name), (event) => {
      /* If no function passed, remove all listeners on this event */
      if (!handler) return delete all[event]
      /* Otherwise remove all listeners */
      all[event].splice(all[event].indexOf(handler) >>> 0, 1)
    })
    return () => on(name, handler)
  }

  function getEvents(key = '', isEmit) {
    const index = key.indexOf(STAR)
    const hasStar = index > -1
    if (!hasStar && !isEmit) {
      return [ key ]
    }
    const events = isEmit ? getWildCards(key, cache) : []
    /* Always loop over existing functions because they may have changed */
    const keys = Object.keys(all)
    for (let i = 0; i < keys.length; i++) {
      if (hasStar && keys[i].startsWith(key.slice(0, index))) {
        !has(events, keys[i]) && events.push(keys[i])
      }
    }
    return events
  }

  return {
    all,
    on,
    off,
    emit(name, data) {
      loop(getEvents(name, true), (event) => {
        loop(all[event], (fn) => fn({ event, src: name, data }))
      })
    },
    clear() {
      all = {}
    },
  }
}