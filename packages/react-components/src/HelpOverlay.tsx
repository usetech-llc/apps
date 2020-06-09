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
}

function HelpOverlay ({ className, md }: Props): React.ReactElement<Props> {
  const [isVisible, toggleVisible] = useToggle();

  return (
    <div className={className}>
      <a className='help-button' onClick={toggleVisible}>
        <Icon
          name='question circle outline'
        />
        Help
      </a>
      <div className={`help-slideout ${isVisible ? 'open' : 'closed'}`}>
        <div className='help-button'>
          <Icon
            name='close'
            onClick={toggleVisible}
          />
        </div>
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
  .help-button {
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 24px;
    padding: 5px 10px;
    background: #FAFAFA;
    color: #464E5F;
  }

  .help-slideout {
    background: #eee;
    border-left: 0.25rem solid #ddd;
    bottom: 0;
    max-width: 50rem;
    overflow-y: scroll;
    position: fixed;
    right: -50rem;
    top: 0;
    transition-duration: .5s;
    transition-property: all;
    z-index: 10;

    .help-button {
      text-align: right;
      background: transparent;
      position: absolute;
      right: 0rem;
      top: 0rem;
    }

    .help-content {
      padding: 1rem 1.5rem 5rem;
    }

    &.open {
      right: 0;
    }
  }
`);
