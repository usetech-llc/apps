// Copyright 2017-2020 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps as Props } from '@polkadot/react-components/types';
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu';

import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppNomination from '@polkadot/app-nomination';
import { useApi } from '@polkadot/react-hooks';
import { Spinner, StatusContext, TelegramNotifications } from '@polkadot/react-components';
import { defaultColor } from '@polkadot/apps-config/ui/general';
import GlobalStyle from '@polkadot/react-components/styles';
import Signer from '@polkadot/react-signer';
import uiSettings from '@polkadot/ui-settings';

import { useTranslation } from './translate';
import './styles.scss';

export const PORTAL_ID = 'portals';

function Application ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const location = useLocation();
  const { isApiConnected, isApiReady } = useApi();
  const { queueAction, stqueue, txqueue } = useContext(StatusContext);
  const isKusama = uiSettings && uiSettings.apiUrl.includes('kusama');

  return (
    <div className={`nomination-stand-alone ${className as string || ''}`}>
      <Menu pointing secondary>
        <div className='center'>
          <Menu.Item
            link
            active={location.pathname === '/new'}
            name='home'
          >
            <Link to={'/new'}>{t('New nomination')}</Link>
          </Menu.Item>
          <Menu.Item
            link
            active={location.pathname === '/manage'}
            name='home'
          >
            <Link to={'/manage'}>{t('Manage nominations')}</Link>
          </Menu.Item>
          <Menu.Menu position='right'>
            <Menu.Item>
              <TelegramNotifications isKusama={isKusama} />
            </Menu.Item>
          </Menu.Menu>
        </div>
      </Menu>

      <GlobalStyle uiHighlight={defaultColor} />

      {!isApiReady && isApiConnected && (
        <div className='connecting'>
          <div className='warning-block'>
            {t('Waiting for access...')}
          </div>
        </div>
      )}

      {!isApiReady && !isApiConnected && (
        <div className='connecting'>
          <Spinner label={t<string>('Initializing connection')}/>
        </div>
      )}

      {isApiReady && isApiConnected && (
        <Signer>
          <AppNomination
            basePath=''
            onStatusChange={queueAction}
            queueAction={queueAction}
            stqueue={stqueue}
            txqueue={txqueue}
          />
        </Signer>
      )}
    </div>
  );
}

export default React.memo(Application);
