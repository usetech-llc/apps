// Copyright 2020 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { from } from 'rxjs';
import { useEffect, useState, useCallback } from 'react';
import { useAccounts, useApi, useDebounce, useFavorites } from '@polkadot/react-hooks';
import { DeriveStakingElected } from '@polkadot/api-derive/types';
import { ValidatorInfo, TargetSortBy } from '../types';
import { extractInfo } from './useSortedTargets';
import { STORE_FAVS_BASE } from '@polkadot/app-staking/constants';
import useValidatorsFilter from './useValidatorsFilter';
import useValidatorsFromServer from './useValidatorsFromServer';

interface UseValidatorsInterface {
  filteredValidators: ValidatorInfo[];
  nominationServerAvailable: boolean;
  validatorsLoading: boolean;
}

/**
 * Get, sort and filter validators
 * @return {Array<ValidatorInfo>} filtered validators
 */
function useValidators (ksi: number): UseValidatorsInterface {
  const { api } = useApi();
  const [_amount] = useState<BN | undefined>(new BN(1_000));
  const [lastEra, setLastEra] = useState<BN | null>(null);
  const [lastReward, setLastReward] = useState<BN | null>(null);
  const [electedInfo, setElectedInfo] = useState<DeriveStakingElected>();
  const { allAccounts } = useAccounts();
  const [{ sortBy, sortFromMax }] = useState<{ sortBy: TargetSortBy; sortFromMax: boolean }>({ sortBy: 'rankOverall', sortFromMax: true });
  const amount = useDebounce(_amount);
  const [favorites] = useFavorites(STORE_FAVS_BASE);
  const [optimalValidators, setOptimalValidators] = useState<ValidatorInfo[]>([]);
  const [validatorsLoading, setValidatorsLoading] = useState(true);
  const filteredElected = useValidatorsFilter(electedInfo);
  const {
    nominationServerAvailable,
    validatorsFromServer,
    validatorsFromServerLoading,
  } = useValidatorsFromServer(ksi);

  const getElectedInfo = useCallback(() => {
    from(api.derive.staking.electedInfo()).subscribe((electedInfo: any) => {
      setElectedInfo(electedInfo);
    });
  }, [api.derive.staking]);

  const getLastEra = useCallback(() => {
    from(api.derive.session.indexes()).subscribe(({ activeEra }: any) => {
      setLastEra(activeEra.gtn(0) ? activeEra.subn(1) : new BN(0));
    });
  }, [api.derive.session]);

  const getLastReward = useCallback(() => {
    if (!lastEra) {
      return;
    }

    from(api.query.staking.erasValidatorReward(lastEra))
      .subscribe((optBalance: any) => {
        setLastReward(optBalance.unwrapOrDefault());
      });
  }, [api.query.staking, lastEra]);

  useEffect((): void => {
    if (filteredElected && filteredElected.info && lastReward) {
      const { validators } = extractInfo(allAccounts, amount, filteredElected, favorites, lastReward);
      if (validators) {
        setOptimalValidators(validators);
        setValidatorsLoading(false);
      }
    }
  }, [allAccounts, amount, electedInfo, favorites, lastReward, sortBy, sortFromMax, filteredElected]);

  useEffect(() => {
    getLastReward();
  }, [getLastReward, lastEra]);

  useEffect(() => {
    setValidatorsLoading(validatorsFromServerLoading);
  }, [validatorsFromServerLoading]);

  // if we have problems with server - we should use client elected info and filter
  useEffect(() => {
    if (!nominationServerAvailable) {
      getLastEra();
      getElectedInfo();
    } else {
      setOptimalValidators(validatorsFromServer);
    }
  }, [getElectedInfo, getLastEra, validatorsFromServer, nominationServerAvailable]);

  return {
    filteredValidators: optimalValidators,
    nominationServerAvailable,
    validatorsLoading
  };
}

export default useValidators;
