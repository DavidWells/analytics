import { h } from 'preact'
import { Router } from 'preact-router'
import { useEffect } from 'preact/hooks'
import analytics from './analytics'

import Header from './components/header'

// Code-splitting is automated for routes
import Home from './routes/home'
import About from './routes/about'
import Dashboard from './routes/dashboard'
import DashboardItem from './routes/dashboardItems'
import Profile from './routes/profile'
import NotFound from './routes/NotFound'
import Login from './routes/login'
import PrivateRoute from './routes/PrivateRoute'

const inBrowser = typeof window !== "undefined"

// Set login false for demo
if (inBrowser) {
	window.isLoggedIn = false
}

export default function App() {
	useEffect(() => {
		analytics.on('pageEnd', ({ payload }) => {
			console.log('pageView fired from analytics', payload.properties)
		})
	}, [])

	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
	const handleRoute = e => {
		if (inBrowser) {
			analytics.page()
		}
	}

	return (
		<div id="app">
			<Header />
			<Router onChange={handleRoute}>
				<Home path='/' />
				<About path='/about' />
				<Login path="/login" />

				<PrivateRoute
					path="/dashboard"
					component={() => <Dashboard />}
				/>
				<PrivateRoute
					path="/dashboard/:id"
					component={(p) => <DashboardItem {...p} />}
				/>
				<PrivateRoute
					path="/dashboard/profile"
					component={() => <Profile user="me" />}
				/>

	      <NotFound type="404" default />
			</Router>
		</div>
	)
}