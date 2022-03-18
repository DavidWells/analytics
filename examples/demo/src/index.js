import React from 'react'
import ReactDOM from 'react-dom'
import Home from './pages/Home'
import About from './pages/About'
import Listeners from './pages/Listeners'
import State from './pages/State'
import KitchenSink from './pages/KitchenSink'
import Privacy from './pages/Privacy'
import PageViewTracking from './components/PageViews'
import { Router } from "@reach/router"
import tester from "@analytics/core/client"
import main from "@analytics/core"

import './index.css'

console.log('tester', tester)
console.log('main', main)

const App = (
  <>
  <PageViewTracking />
  <Router>
    <Home path="/" />
    <About path="/about" />
    <Listeners path='/listeners' />
    <State path='/state' />
    <KitchenSink path='/kitchen-sink' />
    <Privacy path='/privacy' />
  </Router>
  </>
)

ReactDOM.render(App, document.getElementById('root'))
