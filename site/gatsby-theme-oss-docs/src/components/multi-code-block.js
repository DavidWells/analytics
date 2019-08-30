import PropTypes from 'prop-types'
import React, {createContext, useState} from 'react'
import styled from '@emotion/styled'
import {GA_EVENT_CATEGORY_CODE_BLOCK, trackEvent} from '../utils'

const Container = styled.div({
  position: 'relative'
})

export const MultiCodeBlockContext = createContext({})

export function MultiCodeBlock(props) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!Array.isArray(props.children)) {
    return props.children
  }

  function handleLanguageChange(event) {
    setActiveIndex(event.target.value)
    trackEvent({
      eventCategory: GA_EVENT_CATEGORY_CODE_BLOCK,
      eventAction: 'change language',
      eventLabel: languages[event.target.value]
    })
  }

  const languages = props.children.map(child => child.props['data-language'])

  return (
    <Container>
      <MultiCodeBlockContext.Provider
        value={{
          activeIndex,
          languages: languages.map(language => {
            switch (language) {
              case 'javascript':
              case 'js':
              case 'jsx':
                return 'JavaScript'
              case 'typescript':
              case 'ts':
              case 'tsx':
                return 'TypeScript'
              case 'hooks-js':
                return 'Hooks (JS)'
              case 'hooks-ts':
                return 'Hooks (TS)'
              default:
                return language
            }
          }),
          onLanguageChange: handleLanguageChange
        }}
      >
        {props.children[activeIndex]}
      </MultiCodeBlockContext.Provider>
    </Container>
  )
}

MultiCodeBlock.propTypes = {
  children: PropTypes.node.isRequired
}
