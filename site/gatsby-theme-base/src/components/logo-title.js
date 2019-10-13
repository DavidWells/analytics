import PropTypes from 'prop-types'
import React from 'react'
import styled from '@emotion/styled'
import {StaticQuery, graphql} from 'gatsby'
import Logo from './logo'

const Container = styled.div({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  fontSize: 20
})

export default function LogoTitle(props) {
  return (
    <StaticQuery
      query={graphql`
        {
          site {
            siteMetadata {
              title
            }
          }
        }
      `}
      render={data => (
        <Container className={props.className}>
          <Logo height={25} width={25} />
          <span style={{color: '#000', display: 'inline-block', marginLeft: 10, letterSpacing: '-0.7px', fontSize: '22px'}}>
            {data.site.siteMetadata.title}
          </span>
        </Container>
      )}
    />
  )
}

LogoTitle.propTypes = {
  noLogo: PropTypes.bool,
  className: PropTypes.string
}
