// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps } from './types';

import React from 'react';
import ReactMd from 'react-markdown';
import styled from 'styled-components';
import { useToggle } from '@polkadot/react-hooks';

import Icon from './Icon';

interface Props extends BareProps {
  md: string;
  showCloseButton?: boolean;
}

function HelpOverlay ({ className, md, showCloseButton }: Props): React.ReactElement<Props> {
  const [isVisible, toggleVisible] = useToggle();

  return (
    <div className={className}>
      <a
        className='help-button'
        onClick={toggleVisible}
      >
        <Icon
          name='question circle outline'
        />
        Help
      </a>
      <div className={`help-slideout ${isVisible ? 'open' : 'closed'}`}>
        <div className='icons right'>
          <a
            className='help-button'
            onClick={toggleVisible}
          >
            <Icon
              name='arrow left'
            />
            Back to wallet
          </a>
          { showCloseButton && (
            <a
              className='close-window'
              href='/'
              onClick={toggleVisible}
            >
              <Icon name='close' />
              Close window
            </a>
          )}
        </div>
        <header>Help</header>
        <ReactMd
          className='help-content'
          escapeHtml={false}
          source={md}
        />
      </div>
    </div>
  );
}

export default React.memo(styled(HelpOverlay)`

   header {
    font-family: Roboto;
    font-style: normal;
    font-weight: bold;
    font-size: 28px;
    line-height: 36px;
    text-align: left;
    padding: 0 1.5rem;
    margin-bottom: 0;
    margin-top: 1.5rem;
   }
   
  .help-button {
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 24px;
    padding: 5px 10px;
    background: #FAFAFA;
    color: #464E5F;
    cursor: pointer;
  }

  .help-slideout {
    background: #EEF0F8;
    border-left: 0.25rem solid #ddd;
    bottom: 0;
    width: 100%;
    overflow-y: scroll;
    position: absolute;
    right: -100%;
    display: none;
    top: 0;
    transition-duration: .5s;
    transition-property: all;
    z-index: 10;

    .icons.right {
      text-align: right;
      position: absolute;
      padding: 37px 1.5rem 0 0;
      right: 0rem;
      top: 0rem;
    }

    .help-content {
      padding: 1rem 1.5rem 5rem;
    }

    &.open {
      right: 0;
      display: block;
      
      .help-button {
        margin-right: 30px;
      }
    }
  }
`);
