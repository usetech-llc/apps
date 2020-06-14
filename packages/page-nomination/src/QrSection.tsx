// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback } from 'react';
import styled from 'styled-components';

import { useApi } from '@polkadot/react-hooks';
import { HelpOverlay, Icon } from '@polkadot/react-components';
import basicMd from '@polkadot/app-staking/md/basic.md';
import Available from '@polkadot/app-nomination/Available';
import { QrDisplayAddress } from '@polkadot/react-qr';

import telegram from './assets/img/telegram.png';

interface Props {
  accountId: string | null;
  isKusama: boolean;
}

function QrSection ({ accountId, isKusama }: Props): React.ReactElement<Props> {
  const { api } = useApi();

  const closeWindow = useCallback((e: any) => {
    e.preventDefault();
  }, []);

  return (
    <section className='account-qr-info'>
      <div className='header-qr'>
        <HelpOverlay md={basicMd as string} />
        <a
          className='telegram-icon'
          href={isKusama ? 'https://t.me/Kusama_bot ' : 'https://t.me/Polkadot_Ryabina_bot'}
          rel='noreferrer noopener'
          target='_blank'
        >
          <img
            alt='telegram-img'
            className='telegram-img'
            src={telegram as string}
          />
        </a>
        <a
          className='close-window'
          href='/'
          onClick={closeWindow}
        >
          <Icon name='close' />
          Close window
        </a>
      </div>
      <div className='account-panel'>
        {accountId && (
          <Available
            className='qr-panel'
            params={accountId}
          />
        )}
        {accountId && (
          <QrDisplayAddress
            address={accountId}
            className={'qr-center'}
            genesisHash={api.genesisHash.toHex()}
          />
        )}
      </div>
    </section>
  );
}

export default React.memo(styled(QrSection)``);
