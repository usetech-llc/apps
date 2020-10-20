// Copyright 2017-2020 @polkadot/app-accounts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Environment } from '../types';

// https://github.com/electron/electron/issues/2288
function isElectron () {
  return false;
}

export default function getEnvironment (): Environment {
  if (isElectron()) {
    return 'app';
  }

  return 'web';
}
