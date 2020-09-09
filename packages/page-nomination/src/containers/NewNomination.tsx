// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { Balance } from '@polkadot/types/interfaces/runtime';
import { ActionStatus, QueueAction$Add } from '@polkadot/react-components/Status/types';
import { StakerState } from '@polkadot/react-hooks/types';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import BN from 'bn.js';


import AccountSection from '../components/AccountSection';
import BondSection from '../components/BondSection';
import { useBalanceClear, useFees, WholeFeesType } from '../hooks/useBalance';
import { useSlashes } from '../hooks/useShalses';

interface Props {
  accountId: string | null;
  accountsAvailable: boolean;
  amountToNominate: BN | undefined | null;
  isNominating: boolean;
  next?: string[];
  ownStashes: StakerState[] | undefined;
  queueAction: QueueAction$Add;
  setAccountId: (accountId: string | null) => void;
  setAmountToNominate: (amountToNominate: BN | undefined) => void;

  selectedValidators: string[];
  stakingOverview: DeriveStakingOverview | undefined;
  web3Enabled: boolean;
}

function NewNomination (props: Props): React.ReactElement<Props> {
  const {
    accountId,
    accountsAvailable,
    amountToNominate,
    queueAction,
    setAccountId,
    setAmountToNominate,
    selectedValidators,
    web3Enabled,
  } = props;


  const { wholeFees }: WholeFeesType = useFees(accountId, selectedValidators);
  const accountBalance: Balance | null = useBalanceClear(accountId);
  const [maxAmountToNominate, setMaxAmountToNominate] = useState<BN | undefined | null>(null);
  const slashes = useSlashes(accountId);
  const currentAccountRef = useRef<string | null>();

  const calculateMaxPreFilledBalance = useCallback((): void => {
    if (maxAmountToNominate) {
      // double wholeFees
      if (!amountToNominate) {
        setAmountToNominate(maxAmountToNominate);
      }
    }
  }, [amountToNominate, maxAmountToNominate]);

  useEffect(() => {
    calculateMaxPreFilledBalance();
  }, [calculateMaxPreFilledBalance]);

  // if balance is null or lower than double whole fees
  useEffect(() => {
    if (accountBalance && wholeFees) {
      const maxAmount = accountBalance.sub(wholeFees).sub(wholeFees);

      if (maxAmount.gt(new BN(0))) {
        setMaxAmountToNominate(maxAmount);
      } else {
        setMaxAmountToNominate(null);
      }
    }
  }, [accountBalance, wholeFees]);

  // show notification when change account
  useEffect(() => {
    if (currentAccountRef.current && currentAccountRef.current !== accountId) {
      const message: ActionStatus = {
        action: '',
        message: 'Account was changed!',
        status: 'success'
      };

      queueAction([message]);
    }

    currentAccountRef.current = accountId;
  }, [accountId, queueAction]);

  return (
    <div className='nomination-row'>
      <Header as='h1'>New nomination</Header>
      <div className='nomination-card'>
        {!web3Enabled &&
        <div className='error-block'>Please enable the polkadot.js extension!</div>
        }
        {web3Enabled && (
          <AccountSection
            accountId={accountId}
            accountsAvailable={accountsAvailable}
            amount={accountBalance || new BN(0)}
            setAccountId={setAccountId}
          />
        )}
        { amountToNominate && maxAmountToNominate && (
          <>
            <div className='divider' />
            <BondSection
              amountToNominate={amountToNominate}
              maxAmountToNominate={maxAmountToNominate}
              setAmountToNominate={setAmountToNominate}
            />
          </>
        )}
        {/* { !maxAmountToNominate && (
          <div className='error-block'>
            {t('You have no enough balance for nomination')}
          </div>
        )} */}
        { slashes > 0 &&
        <div className='error-block'>Warning: You have been slashed. You need to update your nomination.</div>
        }
        <div className='button-block right'>
          {/* <Button
            icon
            disabled={!selectedValidators.length || !amountToNominate || !amountToNominate.gtn(0) || isNominating}
            loading={isNominating}
            onClick={startNomination}
            primary
          >
            {stashIsCurrent ? 'Add funds' : 'Bond and Nominate'}
            <Icon
              icon={'play'}
            />
          </Button> */}
        </div>
      </div>
    </div>
  );
}

export default React.memo(NewNomination);
