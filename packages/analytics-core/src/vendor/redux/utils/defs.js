export const FUNC = 'function'
export const UNDEF = 'undefined'
export const REDUCER = 'reducer'
/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
const base = '@@redux/'
export const ACTION_INIT = base + 'INIT'
export const ACTION_TEST = base + Math.random().toString(36)
