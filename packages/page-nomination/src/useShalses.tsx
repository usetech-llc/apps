// Copyright 2017-2020 UseTech @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for detail

import { useState, useCallback, useEffect } from 'react';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { useApi } from '@polkadot/react-hooks';

export function checkSlash (onwSlashesObservable: Observable<any>): Observable<any> {
  return onwSlashesObservable.pipe(
    map((slashesInEra: any) => slashesInEra.map((slashInEra: any) => slashInEra.total.toNumber()).reduce((acc: number, val: number) => acc + val))
  );
}

export function useSlashes (accountId: string | null): number {
  const { api } = useApi();
  const [slashesAmount, setSlashesAmount] = useState<number>(0);

  const getSlashesAmount = useCallback(() => {
    if (!accountId) {
      return;
    }

    checkSlash(
      from(api.derive.staking.ownSlashes(accountId, true))
    ).subscribe((res) => setSlashesAmount(res));
  }, [accountId, api.derive.staking]);

  useEffect(() => {
    getSlashesAmount();
  }, [accountId, getSlashesAmount]);

  return slashesAmount;
}
