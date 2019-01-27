import React from 'react'
import ReactDOM from 'react-dom'
import Home from './pages/Home'
import About from './pages/About'
import PageViewTracking from './components/PageViews'
import { Router } from "@reach/router"
import './index.css'

const App = (
  <>
  <PageViewTracking />
  <Router>
    <Home path="/" />
    <About path="/about" />
  </Router>
  </>
)

ReactDOM.render(App, document.getElementById('root'))
