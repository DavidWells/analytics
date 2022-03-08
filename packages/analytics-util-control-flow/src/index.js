

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
 * Fast loop over array of items
 * @param {Array[*]} arr 
 * @param {fn} logic 
 */
function loop(arr = [], logic) {
  for (let i = 0; i < arr.length; i++) logic(arr[i], i)
}

const DOT = '.'
const STAR = '*'

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
  let map = {}
  
  function on(name, handler) {
    all[name] = all[name] || []
    all[name].push(handler)
    map[name] = map[name] || {}
    map[name].wildcards = getWildcards(name)
    // map[name].fns = map[name].fns || []
    // map[name].fns.push(handler)
    return () => off(name, handler)
  }

  function getWildcards(key, hasStar, fromCache) {
    if (fromCache && map[key]) {
      return map[key].wildcards
    }
    let paths = ''
    const parts = key.split(DOT)
    const wildCards = [STAR, key] // Match * and key by default
    const hasDotStar = hasStar && key.charAt(key.length - 2) === DOT
    for (let x = 0; x < parts.length; x++) {
      const notLast = parts.length !== x + 1
      const ending = (hasStar && !notLast) ? '' : STAR
      paths = paths + (x ? DOT : '') + parts[x]
      /* If not last item, compose wildcards from path */
      if (notLast) wildCards.push(paths + DOT + ending)
      /* Has star & ends with dot .* */
      if (!hasDotStar) wildCards.push(paths + ending)
    }
    return wildCards
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
    return Object.keys(all)
      .filter((k) => hasStar && k.startsWith(key.slice(0, index)))
      .concat(isEmit ? getWildcards(key, hasStar, true) : [])
      // Only unique keys
      .filter(function(value, index, self) {
        return self.indexOf(value) === index
      })
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