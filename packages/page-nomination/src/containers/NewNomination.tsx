// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { Balance } from '@polkadot/types/interfaces/runtime';
import { ActionStatus, QueueAction$Add } from '@polkadot/react-components/Status/types';
import { StakerState } from '@polkadot/react-hooks/types';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import BN from 'bn.js';
import { useApi } from '@polkadot/react-hooks';
import { Icon } from '@polkadot/react-components';

import AccountSection from '../components/AccountSection';
import BondSection from '../components/BondSection';
import { useBalanceClear, useFees, WholeFeesType } from '../hooks/useBalance';
import { useSlashes } from '../hooks/useShalses';

interface Props {
  accountId: string | null;
  accountsAvailable: boolean;
  ownStashes: StakerState[] | undefined;
  queueAction: QueueAction$Add;
  setAccountId: (accountId: string | null) => void;
  selectedValidators: string[];
  stakingOverview: DeriveStakingOverview | undefined;
  toNomination: () => void;
  web3Enabled: boolean;
}

function NewNomination ({ accountId, accountsAvailable, ownStashes, queueAction, selectedValidators, setAccountId, toNomination, web3Enabled }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [amountToNominate, setAmountToNominate] = useState<BN | undefined | null>(null);
  const [stashIsCurrent, setStashIsCurrent] = useState<boolean>(false);
  const [isNominating, setIsNominating] = useState<boolean>(false);
  const { wholeFees }: WholeFeesType = useFees(accountId, selectedValidators);
  const accountBalance: Balance | null = useBalanceClear(accountId);
  const [maxAmountToNominate, setMaxAmountToNominate] = useState<BN | undefined | null>(null);
  const slashes = useSlashes(accountId);
  const currentAccountRef = useRef<string | null>();
  const extrinsicBond = (amountToNominate && accountId)
    ? api.tx.staking.bond(accountId, amountToNominate, 2)
    : null;
  const extrinsicNominate = (amountToNominate && accountId)
    ? api.tx.staking.nominate(selectedValidators)
    : null;

  const startNomination = useCallback(() => {
    if (!extrinsicBond || !extrinsicNominate || !accountId) {
      return;
    }

    const txs = [extrinsicBond, extrinsicNominate];

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    api.tx.utility
      .batch(txs)
      .signAndSend(accountId, ({ status }) => {
        if (status.isReady) {
          setIsNominating(true);
        }

        if (status.isInBlock) {
          const message: ActionStatus = {
            action: `included in ${status.asInBlock as unknown as string}`,
            message: 'Funds nominated successfully!',
            status: 'success'
          };

          toNomination();
          queueAction([message]);
          setIsNominating(false);
        }
      });
  }, [accountId, api.tx.utility, extrinsicBond, extrinsicNominate, toNomination, queueAction]);

  const calculateMaxPreFilledBalance = useCallback((): void => {
    if (maxAmountToNominate) {
      // double wholeFees
      if (!amountToNominate) {
        setAmountToNominate(maxAmountToNominate);
      }
    }
  }, [amountToNominate, maxAmountToNominate]);

  const disableStartButton = useCallback(() => {
    if (!ownStashes) {
      return;
    }

    const currentStash = ownStashes.find((stash) => stash.stashId === accountId);

    setStashIsCurrent(!!currentStash);
  }, [accountId, ownStashes]);

  useEffect(() => {
    disableStartButton();
  }, [disableStartButton]);

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
          <Button
            icon
            disabled={!selectedValidators.length || !amountToNominate || !amountToNominate.gtn(0) || isNominating}
            isLoading={isNominating}
            onClick={startNomination}
            primary
          >
            {stashIsCurrent ? 'Add funds' : 'Bond and Nominate'}
            <Icon
              icon={'play'}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(NewNomination);
