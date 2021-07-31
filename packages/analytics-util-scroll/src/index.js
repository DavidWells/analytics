import { throttle } from 'analytics-utils'
import { isBrowser, noOp } from '@analytics/type-utils'

const UP = 'up'
const DOWN = 'down'

function log(args) {
  // console.log(args)
}

function calculateThresholds(docHeight, percentages) {
  return percentages.map((percent) => {
    if (percent === 100) {
      // 1px cushion to trigger 100% event in iOS
      return docHeight - 5
    }
    return docHeight * (percent / 100)
  })
}

export function getScrollTop() {
  if (!isBrowser) return 0
  const body = document.body
  const html = document.documentElement
  return body.scrollTop || html.scrollTop
}

export function getWindowHeight() {
  if (!isBrowser) return 0
  return window.innerHeight || document.documentElement.clientHeight
}

export function getScrollDistance() {
  return Math.round(getScrollTop() + getWindowHeight())
}

export function getDocHeight() {
  if (!isBrowser) return 0
  const body = document.body
  const html = document.documentElement
  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  )
}

export function getScrollPercent(scrollDistance, docHeight) {
  return Math.round((scrollDistance / docHeight) * 100)
}

export function onScrollChange(handlers = {}) {
  if (!isBrowser) return noOp
  const docHeightStart = getDocHeight()
  const scrollTopStart = getScrollTop()
  const scrollDistanceStart = getScrollDistance()
  const scrollBottomPercentStart = getScrollPercent(scrollDistanceStart, docHeightStart)
  const scrollTopPercentStart = getScrollPercent(scrollTopStart, docHeightStart)
  let hasMoved = false
  //*
  log('docHeightStart', docHeightStart)
  log('scrollTopStart', scrollTopStart)
  log('scrollDistanceStart', previous)
  log('scrollBottomPercentStart', scrollBottomPercentStart)
  log('scrollTopPercentStart', scrollTopPercentStart)
  /**/
  let callbackCache = []
  let seenCallbacks = []
  let movedCallbacks = []
  let previous = scrollDistanceStart
  let scrollDistanceMax = scrollBottomPercentStart
  let scrollDistanceMin = scrollTopPercentStart
  /*
  log('Starting scrollDistanceMax', scrollDistanceMax)
  log('Starting scrollDistanceMin', scrollDistanceMin)
  /**/

  const percentKeys = Object.keys(handlers)
  if (!percentKeys.length) {
    return noOp
  }

  const percentages = percentKeys.map(n => Number(n))

  const handler = throttle(() => {
    hasMoved = true
    const docHeightCurrent = getDocHeight()
    // Scroll percentage thresholds
    const thresholds = calculateThresholds(docHeightCurrent, percentages)
    // How far user has scrolled
    const scrollTopCurrent = getScrollTop()
    const scrollDistanceCurrent = getScrollDistance()

    const scrollBottomPercent = getScrollPercent(scrollDistanceCurrent, docHeightCurrent)
    const scrollTopPercent = getScrollPercent(scrollTopCurrent, docHeightCurrent)

    scrollDistanceMax = scrollBottomPercent > scrollDistanceMax ? scrollBottomPercent : scrollDistanceMax
    scrollDistanceMin = scrollTopPercent < scrollDistanceMin ? scrollTopPercent : scrollDistanceMin
    /*
    log('current scrollBottomPercent', scrollBottomPercent)
    log('current scrollDistanceMax', scrollDistanceMax)
    log('current scrollDistanceMin', scrollDistanceMin)
    /**/

    // if we've fired off all percentages, then return
    if (callbackCache.length >= percentages.length) {
      log('all fired. Remove listerner')
      return
    }

    /*
    // Fires all handlers
    thresholds.forEach((height, i) => {
      const key = percentages[i]
      if (!cache.includes(key) && scrollDistanceCurrent >= height) {
        if (typeof handlers[key] === 'function') {
          handlers[key](key, scrollDistanceMax)
        }
        cache.push(key)
      }
    })
    */

    // Trigger any matching scroll handlers
    // log('previous', previous)
    // log('scrollDistanceCurrent', scrollDistanceCurrent)
    const isInitial = previous === scrollDistanceCurrent

    let direction = UP
    if (isInitial) {
      direction = 'initial'
    } else if (previous <= scrollDistanceCurrent) {
      direction = DOWN
    }

    // const direction = (previous >= scrollDistanceCurrent) ? 'down' : 'up'
    let thresholdsArray = thresholds
    let percentagesArray = percentages
    // if (!hasMoved) {

    if (direction === UP || isInitial) {
      thresholdsArray = thresholds.slice().reverse()
      percentagesArray = percentages.slice().reverse()
    }

    // log('Fired Functiuons', callbackCache)

    const triggers = percentagesArray.reduce((acc, percent, i) => {
      const height = thresholdsArray[i]
      /* Shift listener to scroll up  */
      if (movedCallbacks.includes(percent) && scrollDistanceCurrent <= height) {
        movedCallbacks = movedCallbacks.filter((p) => p !== percent)
        acc.singleFunction = percent
      }

      if (
        direction === DOWN
        && !callbackCache.includes(percent)
        && scrollDistanceCurrent >= height
        && percent > scrollTopPercentStart
      ) {
        seenCallbacks.push(percent)
        acc.callbacks = acc.callbacks.concat(percent)
        return acc
      }

      log('Queue up last function only', percent)
      log('scrollBottomPercent', scrollBottomPercent)
      log('scrollTopPercentStart', scrollTopPercentStart)
      if (
        direction === UP
        && !callbackCache.includes(percent)
        && scrollDistanceCurrent <= height
        && percent <= scrollBottomPercent
      ) {
        log('>Queue up last function only', percent)
        log('>scrollBottomPercent', scrollBottomPercent)

        /* Add first only */
        // if (acc.texter.length === 1) {
        //   return acc
        // }

        /* Add last only */
        acc.foundFunc = [percent]

        /* Add all */
        // acc.texter = acc.texter.concat(percent)

        return acc
      }

      if (isInitial && scrollDistanceCurrent >= height) {
        // if (acc.foundFunc.length === 1) {
        //   return acc
        // }
        log(`FOUND ${percent}`)
        if (acc.foundFunc.length === 0) {
          acc.foundFunc = [percent]
        }
      }

      if (!seenCallbacks.includes(percent) && scrollDistanceCurrent >= height) {
        seenCallbacks.push(percent)
        // If closest singleFunction alredy found, shift to scroll up
        if (!acc.singleFunction) {
          log(`fire ${percent}`)
          acc.singleFunction = percent
        } else {
          log(`movedCallbacks ${percent}`)
          movedCallbacks.push(percent)
        }
      }
      return acc
    }, {
      foundFunc: [],
      singleFunction: null,
      callbacks: [],
      direction: direction,
    })

    log('triggers', triggers)

    // Set previous scroll for direction
    previous = scrollDistanceCurrent

    if (direction === DOWN && triggers.callbacks) {
      triggers.callbacks.forEach((match) => {
        log('Call functions')
        if (typeof handlers[match] === 'function') {
          handlers[match]({
            trigger: match,
            direction: direction,
            scrollMin: scrollDistanceMin,
            scrollMax: scrollDistanceMax,
            range: [ scrollDistanceMin, scrollDistanceMax ]
          })
          callbackCache.push(match)
        }
      })
    }

    if (triggers.singleFunction) {
      log('>> Fire singleFunction')
      const { singleFunction, direction } = triggers
      if (typeof handlers[singleFunction] === 'function') {
        handlers[singleFunction]({
          trigger: singleFunction,
          direction: direction,
          scrollMin: scrollDistanceMin,
          scrollMax: scrollDistanceMax,
          range: [ scrollDistanceMin, scrollDistanceMax ]
        })
      }
      callbackCache.push(singleFunction)
    }
  }, 500)

  window.addEventListener('scroll', handler)
  return () => window.removeEventListener('scroll', handler)
}

export function getPercentages() {
  return [...Array(21)].map((v, i) => Number(((.05 * i) * 100).toFixed(2)))
}
