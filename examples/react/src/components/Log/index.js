import React, { Component } from 'react'
import './Log.css'

export default class Log extends Component {
  renderLogItems = (items) => {
    return items.map((item, i) => {
      const event = Object.keys(item).reduce((acc, key) => {
        if (key === 'type') return acc
        acc[key] = item[key]
        return acc
      }, {})
      const words = item.type.match(/:/) ? item.type : <span className='event-core'>{item.type}</span>
      return (
        <div key={i} className='log-item'>
          <div className='log-event'>
            {words}
          </div>
          <div className='log-data'>
            {JSON.stringify(event)}
          </div>
        </div>
      )
    })
  }
  render() {
    const { items } = this.props
    if (!items || !items.length) {
      return null
    }
    return (
      <div className='log-wrapper'>
        <div className='log-header'>
          <div className='log-header-event'>Event</div>
          <div className='log-header-data'>Payload</div>
        </div>
        <div id='log' className='log'>
          {this.renderLogItems(items)}
        </div>
      </div>
    )
  }
}
