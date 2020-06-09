// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';

import { useApi } from '@polkadot/react-hooks';
import { HelpOverlay } from '@polkadot/react-components/index';
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

  return (
    <section>
      <div className='account-qr-info'>
        <a
          className='telegram-icon'
          href={isKusama ? 'https://t.me/Kusama_bot ' : 'https://t.me/Polkadot_Ryabina_bot'}
          rel='noreferrer noopener'
          target='_blank'
        >
          <img
            alt='telegram-img'
            className='telegram-img'
            src={telegram}
          />
        </a>
        <HelpOverlay md={basicMd} />
        {accountId && (
          <Available
            className='qr-panel'
            params={accountId}
          />
        )}
        {accountId &&
        <QrDisplayAddress
          address={accountId}
          className={'qr-center'}
          genesisHash={api.genesisHash.toHex()}
          size={200}
        />
        }
      </div>
    </section>
  );
}

export default React.memo(styled(QrSection)`
  .account-qr-info {
    background: white;
    border: 1px solid #DDDDDD;
    box-sizing: border-box;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    text-align: center;
  }
`);
