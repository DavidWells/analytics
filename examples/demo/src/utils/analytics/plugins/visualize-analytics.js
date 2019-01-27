/**
 * Simply middleware plugin for analytics to visualize events running
 * through the analytics event chain
 */

export const analyticsHistory = []

export default function visualizeState() {
	return store => next => action => {
  	analyticsHistory.push(action)
    return next(action)
	}
}
