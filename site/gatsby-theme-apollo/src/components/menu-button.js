import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import {MdMenu} from 'react-icons/md';
import {css} from '@emotion/core';
import {size} from 'polished';

const StyledButton = styled.button({
  padding: 0,
  marginRight: 20,
  color: 'inherit',
  border: 'none',
  background: 'none',
  outline: 'none',
  cursor: 'pointer',
  svg: css(size(24), {
    display: 'block',
    fill: 'currentColor'
  })
});

export default function MenuButton(props) {
  return (
    <StyledButton onClick={props.onClick}>
      <MdMenu />
    </StyledButton>
  );
}

MenuButton.propTypes = {
  onClick: PropTypes.func.isRequired
};
