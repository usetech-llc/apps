// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ButtonProps } from './types';

import React, { useState } from 'react';
import SUIButton from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import { isUndefined } from '@polkadot/util';
import { LabelHelp } from '@polkadot/react-components';

import Icon from '../Icon';

let idCounter = 0;

function Button ({ children, className, floated, icon, isAnimated, isBasic = false, isCircular = false, isDisabled = false, isFluid = false, isIcon, isLoading = false, isNegative = false, isPositive = false, isPrimary = false, label, labelPosition, onClick, onMouseEnter, onMouseLeave, size, style, tabIndex, tooltip }: ButtonProps): React.ReactElement<ButtonProps> {
  const [triggerId] = useState(`button-${++idCounter}`);
  const props = {
    animate: 'fade',
    animated: isAnimated,
    basic: isBasic,
    circular: isCircular,
    className: `${className as string} ${isIcon && 'isIcon'}`,
    'data-for': triggerId,
    'data-tip': !!tooltip,
    disabled: isDisabled,
    floated,
    fluid: isFluid,
    labelPosition,
    loading: isLoading,
    negative: isNegative,
    onClick,
    onMouseEnter,
    onMouseLeave,
    positive: isPositive,
    primary: isPrimary,
    secondary: !isBasic && !(isPositive || isPrimary || isNegative),
    size: size || (isIcon ? 'tiny' : undefined),
    style,
    tabIndex
  };

  return (
    <>
      {isUndefined(label) && isUndefined(children)
        ? (
          <SUIButton
            {...props}
            icon={icon}
          />
        )
        : (
          <SUIButton {...props}>
            {icon && (
              <>
                <Icon icon={icon} />
                {isIcon ? '' : '  '}
              </>
            )}
            {label}
            {children}
          </SUIButton>
        )
      }
      {tooltip && (
        <LabelHelp
          className='small-help'
          help={tooltip}
        />
      )}
    </>
  );
}

// const ICON_PADDING = 0.5;

export default React.memo(Button);

/*
background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  line-height: 1;
  margin: 0;
  position: relative;
  vertical-align: middle;
  text-align: center;

  &:not(.hasLabel) {
    padding: 0.7em;

    .ui--Icon {
      padding: 0.6rem;
      margin: -0.6rem;
    }
  }

  &:not(.isCircular) {
    border-radius: 0.25rem;
  }

  &:focus {
    outline:0;
  }

  &.hasLabel {
    padding: 0.7rem 1.1rem 0.7rem ${1.1 - ICON_PADDING}rem;

    .ui--Icon {
      margin-right: 0.425rem !important;
    }
  }

  &.isBasic {
    background: #fff;
  }

  &.isCircular {
    border-radius: 10rem;
  }

  &.isDisabled, &.isReadOnly {
    background: none;
    box-shadow: none;
    cursor: not-allowed;
  }

  &.isBusy {
    cursor: wait;
  }

  &.isFull {
    display: block;
    width: 100%;
  }

  &.isIcon {
    background: transparent;
  }

  .ui--Button-spinner {
    visibility: hidden;
  }

  .ui--Button-overlay {
    background: rgba(253, 252, 251, 0.75);
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    visibility: hidden;
  }

  .ui--Icon {
    border-radius: 50%;
    box-sizing: content-box;
    height: 1rem;
    margin: -${ICON_PADDING}rem 0;
    padding: ${ICON_PADDING}rem;
    width: 1rem;
  }

  &.isBusy {
    .ui--Button-spinner {
      visibility: visible;
    }
  }

  &.isDisabled {
    color: #bcbbba;
  }
 */
