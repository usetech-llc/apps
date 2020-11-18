// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { TFunction } from 'i18next';
import { Route } from './types';

import Component  from '@polkadot/app-nft-wallet';

export default function create (t: TFunction): Route {
  return {
    Component,
    display: {
      needsApi: []
    },
    group: 'nft',
    icon: 'users',
    name: 'wallet',
    text: t<string>('nav.nftWallet', 'Wallet', { ns: 'apps-routing' }),
  };
}
