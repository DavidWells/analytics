import React, { Component } from 'react'
import analytics from '../../analytics'
import Log from '../../components/Log'
import Nav from '../../components/Nav'
import Layout from '../../components/Layout'
import './Home.css'

let timer
export default class App extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      history: window.__ANALYTICS_HISTORY__ || []
    }
  }
  componentDidMount() {
    /* Fire a listener on every event */
    this.listener = analytics.on('*', ({ payload }) => {
      delete payload._
      this.setState({
        history: window.__ANALYTICS_HISTORY__.concat(payload)
      })
    })

    /* Interval for analytics debugger for log view */
    timer = setInterval(() => {
      this.setState({ history: window.__ANALYTICS_HISTORY__ })
    }, 1000)

    analytics.on('page:segment', ({ payload }) => {
      console.log('page:segment fired')
    })

    this.pageStartListener = analytics.on('pageStart', ({ payload }) => {
      console.log("PageStart")
    })
    analytics.on('ready', ({ payload }) => {
      console.log("Ready!")
    })
    analytics.ready(({ payload }) => {
      console.log("Ready two!")
    })
  }
  componentWillUnmount() {
    clearInterval(timer)
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
    analytics.identify('xyz-123', {
     traitOne: 'blue',
     traitTwo: 'red',
   }, () => {
     console.log('identify callback')
   })
  }
  render() {
    const { history } = this.state
    return (
      <Layout title='Home'>
        <div className="App">
          <Nav />
          <h2>
            Using `analytics` in React
          </h2>
          <p>Click on nav elements and view the console for events being triggers.
            <br/>
            <br/>
            Page views are automatically fired from `Layout` component & react-helmet
          </p>
          <h2>
            Fire events
          </h2>
          <button onClick={this.doPage}>
            {'analytics.page()'}
          </button>
          <button onClick={this.doTrack}>
            {'analytics.track()'}
          </button>
          <button onClick={this.doIdentify}>
            {'analytics.identify()'}
          </button>
          <h2>Lifecycle</h2>
          <p>Below is a visualization on the analytic events that have fired</p>
          <Log items={history} />
        </div>
      </Layout>
    )
  }
}
