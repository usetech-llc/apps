// Copyright 2020 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveStakingElected } from '@polkadot/api-derive/types';

import { useCallback, useState, useEffect } from 'react';
import { from } from 'rxjs';
import { useApi } from '@polkadot/react-hooks';

function useElectedInfo(shouldGetElectedInfo: boolean) {
  const { api } = useApi();
  const [electedInfo, setElectedInfo] = useState<DeriveStakingElected>();

  const getElectedInfo = useCallback(() => {
    from(api.derive.staking.electedInfo()).subscribe((electedInfo: any) => {
      setElectedInfo(electedInfo);
    });
  }, [api.derive.staking]);

  useEffect(() => {
    if (shouldGetElectedInfo) {
      getElectedInfo();
    }
  }, [getElectedInfo, shouldGetElectedInfo]);

  return electedInfo;
}

export default useElectedInfo;
