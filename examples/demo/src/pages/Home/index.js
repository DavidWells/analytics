import React, { Component } from 'react'
import { Link } from "@reach/router"
import { initialHistory } from '../../utils/analytics/plugins/visualize-analytics'
import analytics from '../../utils/analytics'
import Navigation from '../../fragments/Nav'
import Log from '../../components/Log'
import './Home.css'

export default class App extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      history: window.__ANALYTICS_HISTORY__ || []
    }
  }
  componentDidMount() {
    this.listener = analytics.on('*', ({ payload }) => {
      this.setState({
        history: window.__ANALYTICS_HISTORY__.concat(payload)
      })
    })
    setInterval(() => {
      this.setState({
        history: window.__ANALYTICS_HISTORY__
      })
    }, 1000);

    analytics.on('page:segment', ({ payload }) => {
      console.log('analytics.on page:segment')
    })

    analytics.on('page', ({ payload }) => {
      console.log('PAGE', payload)
    })
  }
  componentWillUnmount() {
    this.listener()
  }
  doPage = () => {
    analytics.page(() => {
      console.log('page callback')
    })
  }
  doTrack = () => {
    analytics.track('buttonClicked', {
      foo: 'bar'
    }, () => {
      console.log('track callback')
    })
  }
  doIdentify = () => {
    analytics.identify('xyz-777', {
     traitOne: 'blue',
     traitTwo: 'red',
   }, () => {
     console.log('identify callback')
   })
  }
  render() {
    const { history } = this.state
    return (
      <div className="App">
        <Navigation />
        <h2>
          <a href='https://github.com/DavidWells/analytics'>Analytics</a>
          <span className="install">npm install analytics</span>
        </h2>
        <p>
          Lightweight extendable analytics library. <a href='https://github.com/DavidWells/analytics#usage'>Read the docs</a>
        </p>
        <button onClick={this.doPage}>
          {`analytics.page()`}
        </button>
        <button onClick={this.doTrack}>
          {`analytics.track()`}
        </button>
        <button onClick={this.doIdentify}>
          {`analytics.identify()`}
        </button>
        <h3>Lifecycle</h3>
        <Log items={history} />
      </div>
    )
  }
}
