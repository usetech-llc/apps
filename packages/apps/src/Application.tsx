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

export const PORTAL_ID = 'portals';

function Application ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { isApiConnected, isApiReady } = useApi();
  const { queueAction, stqueue, txqueue } = useContext(StatusContext);

  return (
    <div className={`nomination-stand-alone ${className as string}`}>
      <GlobalStyle uiHighlight={defaultColor} />
      {(!isApiReady || !isApiConnected)
        ? (
          <div className='ui placeholder segment'>
            <div className='connecting'>
              <Spinner label={t<string>('Initializing connection')}/>
            </div>
          </div>
        )
        : (
          <Signer>
            <AppNomination
              basePath=''
              onStatusChange={queueAction}
              queueAction={queueAction}
              stqueue={stqueue}
              txqueue={txqueue}
            />
          </Signer>
        )
      }
    </div>
  );
}

export default React.memo(styled(Application)`
  align-items: stretch;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  padding: 10px;
  justify-content: center;
  
    .right {
      display: block;
    }
    
    .left-mobile {
      display: none;
    }
  
   .ui.placeholder.segment {
      border-radius: 0;
      background-color: #EEF0F8;
      padding: 24px;
   }
  
  .connecting {
    min-width: 800px;
    display: flex;
    justify-content: center;
  }
  
  .ui.segment {
    min-width: 800px;
  }
  
  .success {
    color: #39C707;
  }
  
  @media (max-width: 800px) {
    .connecting {
      min-width: 100%;
    }
    
    .ui.segment {
      min-width: 100%;
    }
    
    .nomination-row {
      display: block;
    }
    
    .right {
      display: none;
    }
    
    .left-mobile {
      display: block;
      
      .account-panel {
        max-width: 200px;
      }
    }
  }
`);
