import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { useAccounts, useApi, useCall, useDebounce, useFavorites } from '@polkadot/react-hooks';
// import { DeriveStakingElected, DeriveSessionIndexes } from '@polkadot/api-derive/types';
import { Balance } from '@polkadot/types/interfaces';
import { SortBy, extractInfo, AllInfo, sort } from '@polkadot/app-staking/Targets';
import { STORE_FAVS_BASE } from '@polkadot/app-staking/constants';
import { Option } from '@polkadot/types';
import { ValidatorInfo } from '@polkadot/app-staking/Targets/types';
import useValidatorsFilter from './useValidatorsFilter';
import { Filtered, getFiltered, AccountExtend } from '../Overview/CurrentList';

interface useValidatorsInterface {
  validators: ValidatorInfo[];
}

/**
 * Get, sort and filter validators
 * @return {Array<ValidatorInfo>} filtered validators
 */
function useValidators (stakingOverview?: DeriveStakingOverview, next?: string[]): any {
  const [{ elected, validators, waiting }, setFiltered] = useState<Filtered>({});
  const [favorites, toggleFavorite] = useFavorites(STORE_FAVS_BASE);

  /* const { api } = useApi();
  const [_amount] = useState<BN | undefined>(new BN(1_000));
  const { allAccounts } = useAccounts();
  const electedInfo = useCall<DeriveStakingElected>(api.derive.staking.electedInfo, []);
  const [{ sortBy, sortFromMax }] = useState<{ sortBy: SortBy; sortFromMax: boolean }>({ sortBy: 'rankOverall', sortFromMax: true });
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

  const [{ validators }, setWorkable] = useState<AllInfo>({ nominators: [], validators: [] });
  const [validatorsLoading, setValidatorsLoading] = useState(false);
  const filteredElected = useValidatorsFilter(electedInfo, setValidatorsLoading);

  useEffect((): void => {
    if (filteredElected && filteredElected.info) {
      const { nominators, totalStaked, validators } = extractInfo(allAccounts, amount, filteredElected, favorites, lastReward);
      const sorted = sort(sortBy, sortFromMax, validators);
      setWorkable({ nominators, totalStaked, sorted, validators });
      setValidatorsLoading(false);
    }
  }, [allAccounts, amount, electedInfo, favorites, lastReward, sortBy, sortFromMax, filteredElected]);

  return { validators, validatorsLoading }; */

  useEffect((): void => {
    stakingOverview && setFiltered(
      getFiltered(stakingOverview, favorites, next)
    );
  }, [favorites, next, stakingOverview]);

  // console.log('useValidators', elected, 'validators', validators, 'waiting', waiting);
  return validators;
}

export default useValidators;
