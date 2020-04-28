// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

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
  wholeFees: Balance;
  feesLoading: boolean;
}

/**
 * Get fees for controller account to allow start and stop nomination, existentialDeposit
 * @param {string} bondedAddress
 * @param {string} senderAddress
 * @param {Array<string>} validators
 * @return {WholeFeesType} { wholeFees, feesLoading }
 */

export function useFees (bondedAddress?: string | null, senderAddress?: string | null, validators?: string[]): WholeFeesType {
  const [amount, setAmount] = useState<BN>(new BN(1));
  const [feesLoading, setFeesLoading] = useState<boolean>(false);
  const [wholeFees, setWholeFees] = useState<any>(null);
  const api = useApi();
  const existentialDeposit = api.api.consts.balances.existentialDeposit;

  const calculateAmount = useCallback((): void => {
    // any amount to get fees
    const si = formatBalance.findSi('-');
    const TEN = new BN(10);
    const basePower = formatBalance.getDefaults().decimals;
    const siPower = new BN(basePower + si.power);
    const amount = new BN(1).mul(TEN.pow(siPower));

    setAmount(amount);
  }, []);

  useEffect(() => {
    if (!wholeFees && bondedAddress && senderAddress && validators) {
      setFeesLoading(true);
      const fessGetter = forkJoin({
        bond: api.api.tx.staking.bond(bondedAddress, amount, 2).paymentInfo(senderAddress),
        payment: api.api.tx.balances.transfer(bondedAddress, amount).paymentInfo(senderAddress),
        startNomination: api.api.tx.staking.nominate(validators).paymentInfo(senderAddress),
        stopNomination: api.api.tx.staking.chill().paymentInfo(senderAddress)
      }).pipe(catchError((error) => {
        setFeesLoading(false);

        return of(error);
      }));

      fessGetter.subscribe(({ bond, payment, startNomination, stopNomination }) => {
        setFeesLoading(false);
        const paymentFees = payment ? payment.partialFee : new BN(0);
        const bondFees = bond ? bond.partialFee : new BN(0);
        const startNominationFees = startNomination ? startNomination.partialFee : new BN(0);
        const stopNominationFees = stopNomination ? stopNomination.partialFee : new BN(0);

        const whole = paymentFees
          .add(bondFees)
          .add(existentialDeposit)
          .add(startNominationFees)
          .add(stopNominationFees);

        setWholeFees(whole);
      });
    }
  }, [amount, api.api.tx.staking, api.api.tx.balances, bondedAddress, existentialDeposit, senderAddress, validators, wholeFees]);

  useEffect(() => {
    calculateAmount();
  }, [calculateAmount]);

  return { feesLoading, wholeFees };
}

export default useBalance;
