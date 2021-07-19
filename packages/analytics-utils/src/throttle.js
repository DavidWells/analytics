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
