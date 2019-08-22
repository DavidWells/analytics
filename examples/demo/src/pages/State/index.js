import React, { Component } from 'react'
import Navigation from '../../fragments/Nav'
import analytics from '../../utils/analytics'
import './State.css'

export default class App extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      currentState: analytics.getState()
    }
  }
  componentDidMount() {
    this.listener = analytics.on('*', ({ payload }) => {
      const state = Object.assign({}, analytics.getState())
      delete state.queue
      this.setState({
        currentState: state
      })
    })
  }
  componentWillUnmount() {
    this.listener()
  }
  render() {
    const { currentState } = this.state
    return (
      <div className="App">
        <Navigation />
        <h2>Analytics State</h2>
        <p>State contains information about the user, the browser context, & analytic plugins installed</p>
        <p>It can be used inside your application via <code>analytics.getState()</code> or within referenced inside <a href="https://getanalytics.io/plugins/writing-plugins/">plugins</a></p>
        <div className='state'>
          <pre>
            {JSON.stringify(currentState, null, 2)}
          </pre>
        </div>
      </div>
    )
  }
}
