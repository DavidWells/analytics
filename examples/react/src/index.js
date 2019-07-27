import React from 'react'
import ReactDOM from 'react-dom'
import Home from './pages/Home'
import PageOne from './pages/PageOne'
import PageTwo from './pages/PageTwo'
import PageThree from './pages/PageThree'
import analytics from './analytics'
import routeChanges from './utils/routeChanges'
import { Router } from "@reach/router"
import './index.css'

routeChanges((x) => {
  console.log('route changed', x)
})

/* Attach listeners once */
analytics.on('page', () => {
  console.log('Page')
})
analytics.on('pageEnd', () => {
  console.log('Page End')
})
analytics.on('pageStart', function lol() {
  console.log('Page Start')
})

const App = (
  <Router>
    <Home path="/" />
    <PageOne path="/one" />
    <PageTwo path="/two" />
    <PageThree path="/three" />
  </Router>
)

ReactDOM.render(App, document.getElementById('root'))
