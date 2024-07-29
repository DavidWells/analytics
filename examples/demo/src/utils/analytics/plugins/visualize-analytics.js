/**
 * Simple middleware plugin for analytics to visualize events running
 * through the analytics event chain
 */

export let initialHistory = []

export function clearHistory() {
	initialHistory = []
}

export function recordHistory(action) {
	initialHistory.push(action)
}

export default function visualizeState() {
	return store => next => action => {
  	initialHistory.push(action)
    return next(action)
	}
}
