// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { Balance } from '@polkadot/types/interfaces/runtime';
import { ActionStatus, QueueAction$Add } from '@polkadot/react-components/Status/types';
import { StakerState } from '@polkadot/react-hooks/types';

import React, {useState, useEffect, useCallback, useRef} from 'react';
import styled from 'styled-components';
import BN from 'bn.js';
import { useApi } from '@polkadot/react-hooks';
import { Button } from '@polkadot/react-components';

import WalletSelector from './WalletSelector';
import AccountSection from './AccountSection';
import BondSection from './BondSection';
import QrSection from './QrSection';
import { useBalanceClear, useFees, WholeFeesType } from './useBalance';
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
  stakingOverview: DeriveStakingOverview | undefined;
  setWallet: (wallet: string | null) => void;
  toNomination: () => void;
  web3Enabled: boolean;
}

function NewNomination ({ accountId, accountsAvailable, isKusama, ownStashes, queueAction, selectedValidators, setAccountId, setWallet, toNomination, wallet, web3Enabled }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { t } = useTranslation();
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
            message: t('Funds nominated successfully!'),
            status: 'success'
          };

          toNomination();
          queueAction([message]);
          setIsNominating(false);
        }
      });
  }, [accountId, api.tx.utility, extrinsicBond, extrinsicNominate, t, toNomination, queueAction]);

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
        message: t('Account was changed!'),
        status: 'success'
      };

      queueAction([message]);
    }

    currentAccountRef.current = accountId;
  }, [accountId, t, queueAction]);
  console.log('accountBalance', accountBalance);
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
            amount={accountBalance || new BN(0)}
            setAccountId={setAccountId}
          />
        )}
        {accountId && (
          <div className='left-mobile'>
            <QrSection
              accountId={accountId}
              isKusama={isKusama}
            />
          </div>
        )}
        {accountId && (
          <Available
            className='qr-panel'
            params={accountId}
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
        <div className='error-block'>
          {t('Warning: You have been slashed. You need to update your nomination.')}
        </div>
        }
        { (ownStashes && ownStashes.length > 0) && (
          <Button
            className='back'
            label={t('Manage nominations')}
            onClick={toNomination}
          />
        )}
        <Button
          className='start'
          icon='play'
          isDisabled={!selectedValidators.length || !amountToNominate || !amountToNominate.gtn(0) || isNominating}
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
