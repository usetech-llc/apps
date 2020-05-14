// Copyright 2017-2020 @polkadot/app-staking authors & contributors
import { useState, useEffect, useCallback } from 'react';
import { forkJoin, of } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { useApi } from '@polkadot/react-hooks';
import { DeriveStakingElected, DeriveStakingQuery, DeriveAccountInfo } from '@polkadot/api-derive/types';

/**
 * Filter validators by judgements. Empty judgements discard.
 * @param {DeriveStakingElected} electedInfo
 * @return {DeriveStakingElected} filtered validators
 */
function useValidatorsFilter (electedInfo?: DeriveStakingElected): DeriveStakingElected | null {
  const { api } = useApi();
  const [filtered, setFiltered] = useState<DeriveStakingElected | null>(null);

  const getAccountInfo = useCallback((address: string): Promise<DeriveAccountInfo> => {
    return api.derive.accounts.info(address);
  }, [api.derive.accounts]);

  const checkIdentity = useCallback((value: DeriveAccountInfo): boolean => {
    return value.identity.judgements && value.identity.judgements.length > 0;
  }, []);

  const manageAccountInfo = useCallback((address: string): Promise<string | null> => {
    // if we have not empty judgements or parent with not empty judgements, this account is good
    return getAccountInfo(address).then((item: DeriveAccountInfo) => {
      if (checkIdentity(item)) {
        return address;
        // check parent
      } else if (item.identity.parent) {
        return getAccountInfo(item.identity.parent.toString()).then(() => {
          if (checkIdentity(item)) {
            return address;
          }

          return null;
        });
      }

      return null;
    }
    );
  }, [checkIdentity, getAccountInfo]);

  useEffect(() => {
    if (electedInfo && electedInfo.info.length && !filtered) {
      const goodValidatorsList = forkJoin(
        electedInfo.info.map((validator: DeriveStakingQuery) => manageAccountInfo(validator.accountId.toString()))
      ).pipe(
        filter((item) => item !== null),
        catchError((error) => {
          return of(error);
        })
      );

      // take addresses list of good validators
      goodValidatorsList.subscribe((addresses: Array<string | null>) => {
        // filter electedInfo by address from our list
        const electedInfoFiltered = electedInfo.info.filter((validator) => addresses.find((address) => address === validator.accountId.toString()));

        setFiltered({
          info: electedInfoFiltered,
          nextElected: []
        });
      });
    }
  }, [electedInfo, filtered, manageAccountInfo]);

  return filtered;
}

export default useValidatorsFilter;
