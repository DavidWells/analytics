import React from 'react'
import tools from './tools'
import styles from './request.css'

export default function OtherPage() {
  const plugins = tools.map((tool) => {
    return (
      <div className={styles.box}>
        {tool.name}
      </div>
    )
  })
  return (
    <div>{plugins}</div>
  )
}
