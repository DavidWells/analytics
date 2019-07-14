import PropTypes from 'prop-types'
import React from 'react'
import styled from '@emotion/styled'
import {StaticQuery, graphql} from 'gatsby'

const Container = styled.div({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  fontSize: 18
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
          {!props.noLogo && '📊' }&nbsp;
          {data.site.siteMetadata.title}
        </Container>
      )}
    />
  )
}

LogoTitle.propTypes = {
  noLogo: PropTypes.bool,
  className: PropTypes.string
}
