import NavItem from './nav-item'
import PropTypes from 'prop-types'
import React from 'react'
import styled from '@emotion/styled'
import {breakpoints} from 'gatsby-theme-base'

const Container = styled.nav({
  display: 'flex',
  alignSelf: 'stretch',
  marginLeft: 'auto',
  paddingLeft: 40,
  [breakpoints.sm]: {
    display: 'none'
  }
})

const navConfig = {
  '/api': {
    text: 'Docs',
  },
  '/plugins': {
    text: 'Plugins',
  },
  // '/docs/tutorial/introduction': {
  //   text: 'Tutorial',
  //   matchRegex: /^\/docs\/tutorial/
  // },
  'https://analytics-demo.netlify.com': {
    text: 'Demo'
  },
  /* '/docs/react': {
    text: 'Client',
    subpages: {
      '/docs/react': 'React + React Native',
      '/docs/angular': 'Angular',
      'https://github.com/akryum/vue-apollo': 'Vue.js',
      '/docs/link': 'Apollo Link',
      '/docs/ios': 'Native iOS',
      '/docs/android': 'Native Android',
      '/docs/scalajs': 'Scala.js'
    }
  }, */
  // '/docs/community': {
  //   text: 'Community',
  //   subpages: {
  //     'https://blog.apollographql.com': 'Blog',
  //     'https://spectrum.chat/apollo': 'Spectrum',
  //     'https://twitter.com/apollographql': 'Twitter',
  //     'https://youtube.com/channel/UC0pEW_GOrMJ23l8QcrGdKSw': 'YouTube',
  //     '/docs/community': 'Contribute',
  //     'https://summit.graphql.com': 'GraphQL Summit',
  //     'https://graphql.com': 'Explore GraphQL'
  //   }
  // },
  'https://github.com/davidwells/analytics': {
    text: 'Github',
    subpages: {
      'https://github.com/davidwells/analytics/issues': 'Open Issues',
      'https://github.com/DavidWells/analytics/tree/master/packages': 'All Packages',
    }
  },
}

function formatValue(value) {
  return value.startsWith('/') ? `https://getanalytics.io${value}` : value
}

function generateSubpage([value, text]) {
  return {
    value,
    text
  }
}

function generateNavItems(config) {
  return Object.entries(config).map(
    ([value, {text, matchRegex, subpages}]) => ({
      text,
      value: formatValue(value),
      matchRegex,
      subpages: subpages && Object.entries(subpages).map(generateSubpage)
    })
  )
}

export const navItems = generateNavItems(navConfig)

export default function Nav(props) {
  return (
    <Container>
      {navItems.map(({value, text, matchRegex, subpages}) => {
        let isActive = matchRegex
          ? matchRegex.test(props.pathname)
          : props.isPathActive(value)
        if (!isActive && subpages) {
          isActive = subpages.some(subpage =>
            props.isPathActive(subpage.value)
          )
        }

        return (
          <NavItem
            key={value}
            href={formatValue(value)}
            subpages={subpages}
            active={isActive}
          >
            {text}
          </NavItem>
        )
      })}
    </Container>
  )
}

Nav.propTypes = {
  pathname: PropTypes.string.isRequired,
  isPathActive: PropTypes.func.isRequired
}
