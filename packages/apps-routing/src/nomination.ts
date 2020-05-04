// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Route } from './types';

import Nomination from '@polkadot/app-nomination';

export default function create (t: (key: string, text: string, options: { ns: string }) => string): Route {
  return {
    Component: Nomination,
    display: {
      isHidden: false,
      needsAccounts: true,
      needsApi: [
        'tx.balances.transfer',
        'tx.staking.bond'
      ]
    },
    icon: 'cart arrow down',
    name: 'Nomination',
    text: t('nav.nomination', 'Nomination', { ns: 'apps-routing' })
  };
}
