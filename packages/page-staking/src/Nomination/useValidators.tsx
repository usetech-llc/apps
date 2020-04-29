// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { useAccounts, useApi, useCall, useDebounce, useFavorites } from '@polkadot/react-hooks';
import { DeriveStakingElected, DeriveSessionIndexes } from '@polkadot/api-derive/types';
import { Balance } from '@polkadot/types/interfaces';
import { ValidatorInfo, TargetSortBy } from '../types';
import { extractInfo } from '../useSortedTargets';
import { STORE_FAVS_BASE } from '@polkadot/app-staking/constants';
import { Option } from '@polkadot/types';
import useValidatorsFilter from './useValidatorsFilter';

interface UseValidatorsInterface {
  filteredValidators: ValidatorInfo[];
  validatorsLoading: boolean;
}

/**
 * Get, sort and filter validators
 * @return {Array<ValidatorInfo>} filtered validators
 */
function useValidators (): UseValidatorsInterface {
  const { api } = useApi();
  const [_amount] = useState<BN | undefined>(new BN(1_000));
  const { allAccounts } = useAccounts();
  const electedInfo = useCall<DeriveStakingElected>(api.derive.staking.electedInfo, []);
  const [{ sortBy, sortFromMax }] = useState<{ sortBy: TargetSortBy; sortFromMax: boolean }>({ sortBy: 'rankOverall', sortFromMax: true });
  const amount = useDebounce(_amount);
  const [favorites] = useFavorites(STORE_FAVS_BASE);

  const lastEra = useCall<BN>(api.derive.session.indexes as any, [], {
    defaultValue: new BN(0),
    transform: ({ activeEra }: DeriveSessionIndexes) =>
      activeEra.gtn(0) ? activeEra.subn(1) : new BN(0)
  }) || new BN(0);

  const lastReward = useCall<BN>(api.query.staking.erasValidatorReward, [lastEra], {
    transform: (optBalance: Option<Balance>) =>
      optBalance.unwrapOrDefault()
  });

  const [validators, setWorkable] = useState<ValidatorInfo[]>([]);
  const [validatorsLoading, setValidatorsLoading] = useState(true);
  const filteredElected = useValidatorsFilter(electedInfo);

  useEffect((): void => {
    if (filteredElected && filteredElected.info) {
      const { validators } = extractInfo(allAccounts, amount, filteredElected, favorites, lastReward);

      if (validators) {
        setWorkable(validators);
        setValidatorsLoading(false);
      }
    }
  }, [allAccounts, amount, electedInfo, favorites, lastReward, sortBy, sortFromMax, filteredElected]);

  return {
    filteredValidators: validators,
    validatorsLoading
  };
}

export default useValidators;
