import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/index.jsx'
import About from './pages/About/index.jsx'
import Listeners from './pages/Listeners/index.jsx'
import State from './pages/State/index.jsx'
import KitchenSink from './pages/KitchenSink/index.jsx'
import Privacy from './pages/Privacy/index.jsx'
import PageViewTracking from './components/PageViews/index.jsx'
import tester from "@analytics/core/client"
import main from "@analytics/core"

import './index.css'

console.log('tester', tester)
console.log('main', main)

const App = () => (
  <>
    <BrowserRouter>
      <PageViewTracking />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/listeners" element={<Listeners />} />
        <Route path="/state" element={<State />} />
        <Route path="/kitchen-sink" element={<KitchenSink />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  </>
)

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
