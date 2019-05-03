/**
 * Simple middleware plugin for analytics to visualize events running
 * through the analytics event chain
 */

export const initialHistory = []

export default function visualizeState() {
	return store => next => action => {
  	initialHistory.push(action)
    return next(action)
	}
}
