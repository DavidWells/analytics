import React, { Component } from 'react'
import { Link } from "@reach/router"
import { analyticsHistory } from '../../utils/analytics/plugins/visualize-analytics'
import analytics from '../../utils/analytics'
import './Home.css'

export default class App extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      history: analyticsHistory
    }
  }
  componentDidMount() {
    console.log('analytics', analytics)
    console.log('analyticsHistory', analyticsHistory)
    this.listener = analytics.on('*', () => {
      this.setState({
        history: analyticsHistory
      })
    })
  }
  componentWillUnmount() {
    this.listener()
  }
  showAnalyticsActivity = () => {
    const { history } = this.state
    return history.map((item, i) => {
      const event = Object.keys(item).reduce((acc, key) => {
        if(key === 'type' || key === 'meta') return acc
        acc[key] = item[key]
        return acc
      }, {})
      return (
        <div key={i} className='item'>
          <div className='event'>
            {item.type}
          </div>
          <div className='data'>
            {JSON.stringify(event)}
          </div>
        </div>
      )
    })
  }

  render() {
    return (
      <div className="App">
        <div>
          <Link to='/about'>About</Link>
          <Link to='/'>Home</Link>
        </div>
        <div>Analytics</div>
        <div id='log' className='log'>
          {this.showAnalyticsActivity()}
        </div>
      </div>
    )
  }
}
