// Copyright 2017-2020 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps as Props } from '@polkadot/react-components/types';

import React, { useContext } from 'react';
import styled from 'styled-components';
import AppNomination from '@polkadot/app-nomination';
import { useApi } from '@polkadot/react-hooks';
import { Spinner, StatusContext } from '@polkadot/react-components';
import { defaultColor } from '@polkadot/apps-config/ui/general';
import GlobalStyle from '@polkadot/react-components/styles';
import Signer from '@polkadot/react-signer';

import { useTranslation } from './translate';
import Status from './Content/Status';

export const PORTAL_ID = 'portals';

function Application ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { isApiConnected, isApiReady } = useApi();
  const { queueAction, stqueue, txqueue } = useContext(StatusContext);

  return (
    <div className={className}>
      <GlobalStyle uiHighlight={defaultColor} />
      {(!isApiReady || !isApiConnected)
        ? (
          <div className='connecting'>
            <Spinner label={t('Initializing connection')}/>
          </div>
        )
        : (
          <Signer>
            <AppNomination
              basePath=''
              onStatusChange={queueAction}
            />
          </Signer>
        )
      }
      <Status
        queueAction={queueAction}
        stqueue={stqueue}
        txqueue={txqueue}
      />
    </div>
  );
}

export default React.memo(styled(Application)`
  align-items: stretch;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  padding: 10px;
  
  .connecting {
    width: 800px;
    display: flex;
    justify-content: center;
  }
  
  .ui.segment {
    width: 800px;
  }
`);
