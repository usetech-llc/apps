// Copyright 2017-2020 @polkadot/app-staking authors & contributors
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
  const [paymentFees, setPaymentFees] = useState<Balance | null>(null);
  const [bondFees, setBondFees] = useState<Balance | null>(null);
  const [feesLoading, setFeesLoading] = useState<boolean>(false);
  const [wholeFees, setWholeFees] = useState<any>(null);
  const [startNominationFees, setStartNominationFees] = useState();
  const [stopNominationFees, setStopNominationFees] = useState();
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
    if (bondFees && startNominationFees && stopNominationFees && paymentFees) {
      const whole = paymentFees
        .add(bondFees)
        .add(existentialDeposit)
        .add(startNominationFees)
        .add(stopNominationFees);

      setWholeFees(whole);
    }
  }, [bondFees, existentialDeposit, paymentFees, startNominationFees, stopNominationFees]);

  useEffect(() => {
    if (!wholeFees && bondedAddress && senderAddress && validators) {
      setFeesLoading(true);
      const fessGetter = forkJoin({
        bondFees: api.api.tx.staking.bond(bondedAddress, amount, 2).paymentInfo(senderAddress),
        paymentFees: api.api.tx.balances.transfer(bondedAddress, amount).paymentInfo(senderAddress),
        startNominationFees: api.api.tx.staking.nominate(validators).paymentInfo(senderAddress),
        stopNominationFees: api.api.tx.staking.chill().paymentInfo(senderAddress)
      }).pipe(catchError((error) => {
        setFeesLoading(false);

        return of(error);
      }));

      fessGetter.subscribe(({ bondFees, paymentFees, startNominationFees, stopNominationFees }) => {
        setFeesLoading(false);
        setPaymentFees(paymentFees.partialFee);
        setBondFees(bondFees.partialFee);
        setStartNominationFees(startNominationFees.partialFee);
        setStopNominationFees(stopNominationFees.partialFee);
      });
    }
  }, [amount, api.api.tx.staking, api.api.tx.balances, bondedAddress, senderAddress, validators, wholeFees]);

  useEffect(() => {
    calculateAmount();
  }, [calculateAmount]);

  return { feesLoading, wholeFees };
}

export default useBalance;
