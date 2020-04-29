// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveSessionProgress } from '@polkadot/api-derive/types';

import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { useApi, useCall } from '@polkadot/react-hooks';

const ONE = new BN(1);

export default function useBondBlocks (): BN | undefined {
  const { api } = useApi();
  const progress = useCall<DeriveSessionProgress>(api.derive.session.progress, []);
  const [duration, setDuration] = useState<BN | undefined>();

  useEffect((): void => {
    progress?.sessionLength.gt(ONE) && setDuration(
      progress.eraLength.mul(api.consts.staking.bondingDuration)
    );
  }, [api, progress]);

  return duration;
}
