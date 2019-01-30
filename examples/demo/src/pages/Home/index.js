import React, { Component } from 'react'
import { Link } from "@reach/router"
import { analyticsHistory } from '../../utils/analytics/plugins/visualize-analytics'
import analytics from '../../utils/analytics'
import Log from '../../components/Log'
import './Home.css'

export default class App extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      history: analyticsHistory
    }
  }
  componentDidMount() {
    this.listener = analytics.on('*', ({ payload }) => {
      console.log(`* listener ${payload.type}`)
      this.setState({
        history: analyticsHistory
      })
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
      <div className="App">
        <div className="navigation">
          <Link to='/'>Home</Link>
          <Link to='/listeners'>Listeners</Link>
          <Link to='/state'>State</Link>
        </div>
        <h2>
          <a href='https://github.com/DavidWells/analytics'>Analytics</a>
          <span className="install">npm install analytics</span>
        </h2>
        <p>Lightweight pluggable analytics library. <a href='https://github.com/DavidWells/analytics#usage'>Read the docs</a></p>
        <button onClick={this.doPage}>
          analytics.page()
        </button>
        <button onClick={this.doTrack}>
          analytics.track()
        </button>
        <button onClick={this.doIdentify}>
          analytics.identify()
        </button>
        <h3>Lifecycle</h3>
        <Log
          items={history}
        />
      </div>
    )
  }
}
