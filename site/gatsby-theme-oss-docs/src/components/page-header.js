import PropTypes from 'prop-types'
import React from 'react'
import styled from '@emotion/styled'
import {colors} from 'gatsby-theme-base'

const Heading = styled.h1({
  ':not(:last-child)': {
    marginBottom: 8
  }
})

const Subheading = styled.h3({
  color: colors.text2
})

export default function PageHeader(props) {
  let subTitle
  const titleContent = props.pageTitle || props.title
  const subTitleContent = props.subTitle || props.description
  if (subTitleContent) {
    subTitle = <Subheading>{subTitleContent}</Subheading>
  }

  return (
    <div className="header-wrapper">
      <Heading>{titleContent}</Heading>
      {subTitle}
    </div>
  )
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string
}
