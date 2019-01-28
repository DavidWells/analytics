import React, { Component } from 'react'
import { Link } from "@reach/router"
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
      this.setState({
        currentState: analytics.getState()
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
        <div>
          <Link to='/'>Home</Link>
        </div>
        <h2>Analytics State</h2>
        <div className='state'>
          <pre>
            {JSON.stringify(currentState, null, 2)}
          </pre>
        </div>
      </div>
    )
  }
}
