// Copyright 2017-2020 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Dropdown } from '@polkadot/react-components';

import { useTranslation } from './translate';
import polkadot from './assets/img/polkadot.png';
import enzyme from './assets/img/enzyme.png';
import math from './assets/img/math.png';
import ledger from './assets/img/ledger.png';
import speckle from './assets/img/speckle.png';

interface Props {
  value?: string | null;
  className?: string;
  title?: string;
  onChange: (accountId: string | null) => void;
}

const wallets = [
  {
    image: { avatar: true, src: polkadot },
    key: 'PolkadotJS',
    text: 'PolkadotJS',
    value: 'PolkadotJS'
  },
  {
    disabled: true,
    image: { avatar: true, src: speckle },
    key: 'Speckle OS',
    text: 'Speckle OS',
    value: 'Speckle OS'
  },
  {
    disabled: true,
    image: { avatar: true, src: enzyme },
    key: 'Enzyme',
    text: 'Enzyme',
    value: 'Enzyme'
  },
  {
    disabled: true,
    image: { avatar: true, src: math },
    key: 'Math Wallet',
    text: 'Math Wallet'
  },
  {
    disabled: true,
    image: { avatar: true, src: ledger },
    key: 'Ledger Nano',
    text: 'Ledger Nano',
    value: 'Ledger Nano'
  }
];

function WalletSelector ({ className, onChange, title }: Props): React.ReactElement<Props> {
  const [wallet, setWallet] = useState<any>(wallets[0]);
  const { t } = useTranslation();

  useEffect((): void => {
    if (wallet) {
      onChange(wallet);
    }
  }, [wallet, onChange]);

  return (
    <section className={className} >
      <h2>{title}</h2>
      <Dropdown
        defaultValue={wallets[0].value}
        help={t('Some wallets will be enabled later')}
        isFull
        label={t('Connect to a wallet')}
        onChange={setWallet}
        options={wallets}
      />
    </section>
  );
}

export default React.memo(styled(WalletSelector)`
  align-items: flex-end;

  .summary {
    text-align: center;
  }
  
  .text-block {
    width: 50px !important;
    line-height: 60px;
    text-align: center;
    font-size: 16px;
  }
`);
