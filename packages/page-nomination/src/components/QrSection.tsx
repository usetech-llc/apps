// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';

import { useApi } from '@polkadot/react-hooks';
import { QrDisplayAddress } from '@polkadot/react-qr';
import CloseBlock from './CloseBlock';

interface Props {
  accountId: string | null;
  isKusama: boolean;
}

function QrSection ({ accountId, isKusama }: Props): React.ReactElement<Props> {
  const { api } = useApi();

  return (
    <section className='account-qr-info'>
      <div className='header-qr'>
        <CloseBlock
          isKusama={isKusama}
        />
      </div>
      <div className='account-panel'>
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
