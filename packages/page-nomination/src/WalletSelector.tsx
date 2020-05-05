// Copyright 2017-2020 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Dropdown } from '@polkadot/react-components';

interface Props {
  value?: string | null;
  className?: string;
  title?: string;
  onChange: (accountId: string | null) => void;
}

const wallets = [
  {
    image: { avatar: true, src: '/' },
    key: 'PolkadotJS',
    text: 'PolkadotJS',
    value: 'PolkadotJS',
  },
  {
    disabled: true,
    image: { avatar: true, src: '/' },
    key: 'Speckle OS',
    text: 'Speckle OS',
    value: 'Speckle OS'
  },
  {
    disabled: true,
    image: { avatar: true, src: '/' },
    key: 'Enzyme',
    text: 'Enzyme',
    value: 'Enzyme'
  },
  {
    image: { avatar: true, src: '/' },
    key: 'Math Wallet',
    text: 'Math Wallet',
    value: 'Math Wallet'
  },
  {
    disabled: true,
    image: { avatar: true, src: '/' },
    key: 'Ledger Nano',
    text: 'Ledger Nano',
    value: 'Ledger Nano'
  }
];

function WalletSelector ({ className, onChange, title, value }: Props): React.ReactElement<Props> {
  const [wallet, setWallet] = useState<any>(wallets[0]);

  useEffect((): void => {
    if (wallet) {
      onChange(wallet);
    }
  }, [wallet, onChange]);

  return (
    <section className={className} >
      <h2>{title}</h2>
      <Dropdown
        help={'Some wallets will be enabled later'}
        isFull
        label={'Connect to a wallet'}
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
