// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { Balance } from '@polkadot/types/interfaces/runtime';
import { ActionStatus, QueueAction$Add } from '@polkadot/react-components/Status/types';
import { StakerState } from '@polkadot/react-hooks/types';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import BN from 'bn.js';
import { useApi } from '@polkadot/react-hooks';
import { Button } from '@polkadot/react-components';

import WalletSelector from './WalletSelector';
import AccountSection from './AccountSection';
import BondSection from './BondSection';
import QrSection from './QrSection';
import { useBalanceClear, useFees, WholeFeesType } from './useBalance';
import useValidators from './useValidators';
import { useTranslation } from './translate';
import { useSlashes } from './useShalses';
import Available from './Available';

interface Props {
  accountId: string | null;
  accountsAvailable: boolean;
  isKusama: boolean;
  wallet: string | null;
  ownStashes: StakerState[] | undefined;
  queueAction: QueueAction$Add;
  setAccountId: (accountId: string | null) => void;
  selectedValidators: string[];
  setSelectedValidators: (validators: string[]) => void;
  stakingOverview: DeriveStakingOverview | undefined;
  setWallet: (wallet: string | null) => void;
  toNomination: () => void;
  web3Enabled: boolean;
}

function NewNomination ({ accountId, accountsAvailable, isKusama, ownStashes, queueAction, selectedValidators, setAccountId, setSelectedValidators, setWallet, stakingOverview, toNomination, wallet, web3Enabled }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { t } = useTranslation();
  const [amountToNominate, setAmountToNominate] = useState<BN | undefined>(new BN(0));
  const [amount, setAmount] = useState<BN | undefined>(new BN(0));
  const [stashIsCurrent, setStashIsCurrent] = useState<boolean>(false);
  const { filteredValidators } = useValidators();
  const [isNominating, setIsNominating] = useState<boolean>(false);
  const { wholeFees }: WholeFeesType = useFees(accountId, selectedValidators);
  const accountBalance: Balance | null = useBalanceClear(accountId);
  const [balanceInitialized, setBalanceInitialized] = useState<boolean>(false);
  const slashes = useSlashes(accountId);
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

    setIsNominating(true);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    api.tx.utility
      .batch(txs)
      .signAndSend(accountId, ({ status }) => {
        if (status.isInBlock) {
          const message: ActionStatus = {
            action: `included in ${status.asInBlock as unknown as string}`,
            message: t('Funds nominated successfully!'),
            status: 'success'
          };

          queueAction([message]);
          setIsNominating(false);
        }
      });
  }, [accountId, api.tx.utility, extrinsicBond, extrinsicNominate, t, queueAction]);

  const calculateMaxPreFilledBalance = useCallback((): void => {
    if (!wholeFees || !accountBalance) {
      return;
    }

    if (accountBalance.gtn(0)) {
      // double wholeFees
      setBalanceInitialized(false);
      setAmount(accountBalance.sub(wholeFees).sub(wholeFees));
    }
  }, [accountBalance, wholeFees]);

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

  // nominate amount initialization
  useEffect(() => {
    setBalanceInitialized(true);
  }, [amount]);

  /**
   * Set validators list.
   * If filtered validators
   */
  useEffect(() => {
    if (filteredValidators && filteredValidators.length) {
      setSelectedValidators(
        filteredValidators.map((validator): string => validator.key).slice(0, 16)
      );
    } else {
      stakingOverview && setSelectedValidators(
        stakingOverview.validators.map((acc): string => acc.toString()).slice(0, 16)
      );
    }
  }, [filteredValidators, setSelectedValidators, stakingOverview]);

  return (
    <div className='nomination-row'>
      <div className='left'>
        <h1>{t('New nomination')}</h1>
        <WalletSelector
          onChange={setWallet}
          title={t<string>('Connect to a wallet')}
          value={wallet}
        />
        {!web3Enabled &&
        <div className='error-block'>{t('Please enable the polkadot.js extension!')}</div>
        }
        {web3Enabled && (
          <AccountSection
            accountId={accountId}
            accountsAvailable={accountsAvailable}
            amount={amount}
            setAccountId={setAccountId}
          />
        )}
        {accountId && (
          <Available
            className='qr-panel'
            params={accountId}
          />
        )}
        <div className='divider' />
        <BondSection
          amount={amount}
          balanceInitialized={balanceInitialized}
          setAmountToNominate={setAmountToNominate}
        />
        { slashes > 0 &&
        <div className='error-block'>
          {t('Warning: You have been slashed. You need to update your nomination.')}
        </div>
        }
        { (ownStashes && ownStashes.length > 0) && (
          <Button
            className='back'
            isDisabled
            label={t('Manage nominations')}
            onClick={toNomination}
          />
        )}
        <Button
          className='start'
          icon='play'
          isLoading={isNominating}
          isPrimary
          label={stashIsCurrent ? t('Add funds') : t('Bond and Nominate')}
          onClick={startNomination}
        />
      </div>
      <div className='right'>
        <QrSection
          accountId={accountId}
          isKusama={isKusama}
        />
      </div>
    </div>
  );
}

export default React.memo(styled(NewNomination)``);
