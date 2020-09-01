// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { HelpOverlay, Icon } from '@polkadot/react-components';

import basicMd from '../md/basic.md';

interface Props {
  showCloseButton?: boolean;
}

function CloseBlock ({ showCloseButton = false }: Props): React.ReactElement<Props> {
  const closeWindow = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
  }, []);

  return (
    <>
      <HelpOverlay
        className={'help-button-block'}
        md={basicMd as string}
        showCloseButton={showCloseButton}
      />
      { showCloseButton && (
        <a
          className='close-window'
          href='/'
          onClick={closeWindow}
        >
          <Icon name='close' />
        </a>
      )}
    </>
  );
}

export default React.memo(styled(CloseBlock)``);
