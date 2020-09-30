// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ValidatorInfo } from '@polkadot/app-nomination/types';

import BN from 'bn.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { useState, useEffect, useCallback } from 'react';
import { useApi, useCall } from '@polkadot/react-hooks';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { formatNumber, formatBalance } from '@polkadot/util';
import { Balance } from '@polkadot/types/interfaces/runtime';

// Known account we want to use (available on dev chain, with funds)

export function useBalance (address?: string | null): string | null {
  const api = useApi();
  const balancesAll = useCall<DeriveBalancesAll>(api.api.derive.balances.all as any, [address]);

  return balancesAll ? formatNumber(balancesAll.freeBalance) : null;
}

export function useBalanceClear (address?: string | null): Balance | null {
  const api = useApi();
  const balancesAll = useCall<DeriveBalancesAll>(api.api.derive.balances.all as any, [address]);

  return balancesAll ? balancesAll.availableBalance : null;
}

export type WholeFeesType = {
  wholeFees: BN | null;
  feesLoading: boolean;
}

/**
 * Get fees for controller account to allow start and stop nomination, existentialDeposit
 * @param {string} accountId
 * @param {Array<string>} validators
 * @return {WholeFeesType} { wholeFees, feesLoading }
 */

export function useFees (accountId?: string | null, validators?: ValidatorInfo[]): WholeFeesType {
  const [amount, setAmount] = useState<BN>(new BN(1));
  const [feesLoading, setFeesLoading] = useState<boolean>(false);
  const [wholeFees, setWholeFees] = useState<BN | null>(null);
  const api = useApi();
  const existentialDeposit = api.api.consts.balances.existentialDeposit;

  /* const getFromSessionStorage = useCallback(() => {
    const feesData: { wholeFees: BN | null | undefined, feesLoading: boolean | undefined } = JSON.parse(sessionStorage.getItem('feesData') || '{}');
    return feesData;
  }, []); */

  const calculateAmount = useCallback((): void => {
    // any amount to get fees
    const si = formatBalance.findSi('-');
    const TEN = new BN(10);
    const basePower = formatBalance.getDefaults().decimals;
    const siPower = new BN(basePower + si.power);
    const amount = new BN(1).mul(TEN.pow(siPower));

    setAmount(amount);
  }, []);

  const calculateFees = useCallback(() => {
    if (!wholeFees && accountId && validators && validators.length && amount) {
      setFeesLoading(true);
      const fessGetter = forkJoin({
        withdraw: api.api.tx.staking.withdrawUnbonded(0).paymentInfo(accountId),
        startNomination: api.api.tx.staking.nominate(validators.map(validator => validator.accountId)).paymentInfo(accountId),
        stopNomination: api.api.tx.staking.chill().paymentInfo(accountId),
        unbond: api.api.tx.staking.unbond(amount).paymentInfo(accountId)
      }).pipe(catchError((error) => {
        setFeesLoading(false);
        return of(error);
      }));

      fessGetter.subscribe(({ withdraw, startNomination, stopNomination, unbond }) => {
        setFeesLoading(false);
        const withdrawalFees: BN = withdraw ? withdraw.partialFee : new BN(0);
        const startNominationFees = startNomination ? startNomination.partialFee : new BN(0);
        const stopNominationFees = stopNomination ? stopNomination.partialFee : new BN(0);
        const unbondFees = unbond ? unbond.partialFee : new BN(0);

        const whole = withdrawalFees
          .add(existentialDeposit)
          .add(startNominationFees)
          .add(stopNominationFees)
          .add(unbondFees);

        setWholeFees(whole);
      });
    }
  }, [accountId, amount, api.api.tx.staking, api.api.tx.balances, existentialDeposit, validators, wholeFees]);

  useEffect(() => {
    calculateAmount();
  }, [calculateAmount]);

  useEffect(() => {
    // if we have fees in sessionStorage
    calculateFees();
  }, [accountId, amount, existentialDeposit, validators, wholeFees]);

  return { feesLoading, wholeFees };
}

export default useBalance;
