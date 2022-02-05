import React, { Component } from 'react'
import analytics from '../../utils/analytics'
import Log from '../../components/Log'
import Navigation from '../../fragments/Nav'

export default class App extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      history: window.__global__.analytics || []
    }
  }
  componentDidMount() {
    this.listener = analytics.on('*', ({ payload }) => {
      this.setState({
        history: window.__global__.analytics.concat(payload)
      })
    })
    this.sync = setInterval(() => {
      this.setState({
        history: window.__global__.analytics
      })
    }, 1000)
  }
  componentWillUnmount() {
    // remove listener
    this.listener()
  }

  handleOptOut = () => {
    analytics.identify('xyz-123', {
      optOut: true
    })
  }

  clearLog = () => {
    // Clear previous history
    clearInterval(this.sync)
    this.listener()

    this.setState({
      history: []
    }, () => {
      // re-attach listener to show history
      this.listener = analytics.on('*', ({ payload }) => {
        this.setState({
          history: this.state.history.concat(payload)
        })
      })
    })
  }
  renderProviders() {
    const plugins = analytics.getState('plugins')

    return Object.keys(plugins).map((name, i) => {
      const disable = () => {
        analytics.disablePlugin([name])
      }
      const enable = () => {
        analytics.enablePlugin([name])
      }
      const word = (plugins[name].enabled) ? 'off' : 'on'
      const handler = (plugins[name].enabled) ? disable : enable
      return (
        <button onClick={handler} key={i}>
          Turn {word} plugin {name}
        </button>
      )
    })
  }
  render() {
    const { history } = this.state
    return (
      <div className="app">
        <Navigation />
        <h2 className="kitchen-sink-title">Analytics Privacy & GDPR Features
          <button onClick={this.clearLog}>
            Clear logs
          </button>
        </h2>

        <div className='section-wrapper'>
          <div className='section'>
            <h3>Opt out of all tracking</h3>
            <button onClick={this.handleOptOut}>
              Visitor Opt out
            </button>
          </div>


        </div>
        <div className='section-wrapper'>

          <div className='section'>
            <h3>Allow visitors to choose analytics</h3>
            {this.renderProviders()}
          </div>
          <div className='section'>

          </div>
        </div>
        <Log items={history} />
      </div>
    )
  }
}
