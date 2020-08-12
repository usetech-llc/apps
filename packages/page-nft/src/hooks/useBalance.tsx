// Copyright 2017-2020 @polkadot/react-hooks authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState, useCallback } from 'react';

export default function useBalance (accountId: string | null, api: any) {
  // @ts-ignore
  const [balance, setBalance] = useState<any | null>(null);
  const [balanceError, setBalanceError] = useState<boolean>(false);
  const [existentialDeposit, setExistentialDeposit] = useState<any | null>(null);
  const getAccountBalance = useCallback( async () => {
    try {
      if (!accountId || !api) {
        return;
      }
      const { data: balance } = await api.query.system.account(accountId);
      setBalance(balance);
      setBalanceError(false);
      const existentialDeposit = api.consts.balances.existentialDeposit;
      setExistentialDeposit(existentialDeposit);
      // @todo add transfer fees
      // const transferFees = await api.tx.nft.transfer('0', '0', accountId).paymentInfo(accountId);
      // console.log('transferFees', transferFees);
    } catch (e) {
      console.log('getAccountBalance error', e);
      setBalanceError(true);
    }
  }, [accountId, api]);

  useEffect(() => {
    void getAccountBalance();
  }, [accountId, api]);

  return { balance, existentialDeposit, balanceError };
}