import PropTypes from 'prop-types'
import React from 'react'
import {Select} from './select'
import {navigate, withPrefix} from 'gatsby'

export default function SelectLink({options, useLink, isPathActive, ...props}) {
  function handleChange(event) {
    if (useLink) {
      navigate(event.target.value)
      return
    }

    window.location.href = event.target.value
  }

  let value
  options.forEach(option => {
    const path = useLink ? withPrefix(option.value) : option.value
    const isActive = option.matchRegex
      ? option.matchRegex.test(path)
      : isPathActive(path)
    if (isActive) {
      value = option.value
    }

    if (option.subpages) {
      option.subpages.forEach(subpage => {
        if (isPathActive(subpage.value)) {
          value = option.value
        }
      })
    }
  })

  return (
    <Select {...props} value={value} onChange={handleChange}>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.text}
        </option>
      ))}
    </Select>
  )
}

SelectLink.propTypes = {
  options: PropTypes.array.isRequired,
  isPathActive: PropTypes.func.isRequired,
  useLink: PropTypes.bool
}
