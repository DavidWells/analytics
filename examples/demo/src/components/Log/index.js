import React, { Component } from 'react'
import './Log.css'

const DEBUG = false

export default class Log extends Component {
  renderLogItems = (items) => {
    return items.map((item, i) => {
      const event = Object.keys(item).reduce((acc, key) => {
         if (!DEBUG) {
           if (key === 'type' || key === '_') return acc
           if (key === 'type') return acc
         }
        acc[key] = item[key]
        return acc
      }, {})
      return (
        <div key={i} className='log-item'>
          <div className='log-event'>
            {item.type}
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
