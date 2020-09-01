// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Routes } from './types';

import appSettings from '@polkadot/ui-settings';

// When adding here, also ensure to add to Dummy.tsx

import accounts from './accounts';
import contracts from './contracts';
import explorer from './explorer';
import genericAsset from './generic-asset';
import js from './js';
import settings from './settings';
import staking from './staking';
import sudo from './sudo';
import nomination from './nomination';

export default function create (t: <T = string> (key: string, text: string, options: { ns: string }) => T): Routes {
  return appSettings.uiMode === 'light'
    ? [
      // dashboard,
      explorer(t),
      accounts(t),
      genericAsset(t),
      null,
      staking(t),
      nomination(t),
      // TODO Not sure about the inclusion of treasury, parachains & society here
      null,
      settings(t),
    ]
    : [
      // dashboard(t),
      explorer(t),
      accounts(t),
      genericAsset(t),
      null,
      staking(t),
      nomination(t),
      null,
      contracts(t),
      sudo(t),
      null,
      settings(t),
      js(t),
    ];
}
