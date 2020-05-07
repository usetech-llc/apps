// Copyright 2017-2020 @polkadot/app-nomination authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// global app props
import { AppProps as Props } from '@polkadot/react-components/types';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { ElectionStatus } from '@polkadot/types/interfaces';
import { ActionStatus } from '@polkadot/react-components/Status/types';
import { Balance } from '@polkadot/types/interfaces/runtime';

// external imports (including those found in the packages/*
// of this repo)
import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import BN from 'bn.js';
import styled from 'styled-components';
import { Button, HelpOverlay, InputBalance, StatusContext } from '@polkadot/react-components';
import basicMd from '@polkadot/app-staking/md/basic.md';
import { useApi, useCall, useOwnStashInfos, useStashIds } from '@polkadot/react-hooks';
import useValidators from '@polkadot/app-staking/Nomination/useValidators';
import { QrDisplayAddress } from '@polkadot/react-qr';
import useSortedTargets from '@polkadot/app-staking/useSortedTargets';
import keyring from '@polkadot/ui-keyring';
import { web3FromSource } from '@polkadot/extension-dapp';

// local imports and components
import AccountSelector from './AccountSelector';
import EraToTime from './EraToTime';
import Available from './Available';
import Actions from './Actions';
import WalletSelector from './WalletSelector';
import { useFees, WholeFeesType, useBalanceClear } from './useBalance';
import { useTranslation } from './translate';

interface Validators {
  next?: string[];
  validators?: string[];
}

function Nomination ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const ownStashes = useOwnStashInfos();
  const targets = useSortedTargets();
  const allStashes = useStashIds();
  const stakingOverview = useCall<DeriveStakingOverview>(api.derive.staking.overview, []);
  const isInElection = useCall<boolean>(api.query.staking?.eraElectionStatus, [], {
    transform: (status: ElectionStatus) => status.isOpen
  });
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const { filteredValidators } = useValidators();
  const [{ next, validators }, setValidators] = useState<Validators>({});
  const [accountId, setAccountId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [amount, setAmount] = useState<BN | undefined>(new BN(0));
  const [amountToNominate, setAmountToNominate] = useState<BN | undefined>(new BN(0));
  const accountSegment: any = useRef(null);
  const accountBalance: Balance | null = useBalanceClear(accountId);
  const { wholeFees }: WholeFeesType = useFees(accountId, selectedValidators);
  const { queueAction } = useContext(StatusContext);
  const extrinsicBond = (amountToNominate && accountId)
    ? api.tx.staking.bond(accountId, amountToNominate, 2)
    : null;
  const extrinsicNominate = (amountToNominate && accountId)
    ? api.tx.staking.nominate(selectedValidators)
    : null;

  const calculateMaxPreFilledBalance = useCallback((): void => {
    if (!wholeFees || (!amount || amount.gtn(0)) || !accountBalance) {
      return;
    }

    if (accountBalance.toNumber() && !amount.toNumber()) {
      // double wholeFees
      setAmount(accountBalance.sub(wholeFees).sub(wholeFees));
    }
  }, [accountBalance, amount, wholeFees]);

  const startNomination = useCallback(() => {
    if (!extrinsicBond || !extrinsicNominate || !accountId) {
      return;
    }

    const txs = [extrinsicBond, extrinsicNominate];

    api.tx.utility
      .batch(txs)
      .signAndSend(accountId, ({ status }) => {
        if (status.isInBlock) {
          const message: ActionStatus = {
            action: `included in ${status.asInBlock}`,
            message: t('Funds nominated successfully!'),
            status: 'success'
          };

          queueAction([message]);
        }
      });
  }, [accountId, api.tx.utility, extrinsicBond, extrinsicNominate, t, queueAction]);

  const setSigner = useCallback(async () => {
    if (!accountId) {
      return;
    }

    const pair = keyring.getAddress(accountId, null);

    if (!pair) {
      return;
    }

    const { meta: { source } } = pair;

    if (!source) {
      return;
    }

    const injected = await web3FromSource(source);

    api.setSigner(injected.signer);
  }, [accountId, api]);

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
  }, [filteredValidators, stakingOverview]);

  useEffect(() => {
    if (!accountId) {
      return;
    }

    setSigner().then();
  }, [accountId, setSigner]);

  useEffect((): void => {
    allStashes && stakingOverview && setValidators({
      next: allStashes.filter((address) => !stakingOverview.validators.includes(address as any)),
      validators: stakingOverview.validators.map((a) => a.toString())
    });
  }, [allStashes, stakingOverview]);

  useEffect(() => {
    calculateMaxPreFilledBalance();
  }, [calculateMaxPreFilledBalance, wholeFees]);

  useEffect(() => {
    if (accountSegment && accountSegment.current) {
      window.scrollTo(0, accountSegment.current.offsetTop);
    }
  }, []);

  return (
    // in all apps, the main wrapper is setup to allow the padding
    // and margins inside the application. (Just from a consistent pov)
    <main className={`nomination-app ${className}`}>
      <HelpOverlay md={basicMd} />
      <div className='ui placeholder segment'>
        <WalletSelector
          onChange={setWallet}
          title={t('Connect to a wallet')}
          value={wallet}
        />
      </div>
      <div
        className='ui placeholder segment'
        ref={accountSegment}
      >
        <AccountSelector
          onChange={setAccountId}
          title={t('Your account')}
          value={accountId}
        />
        {accountId && (
          <Available
            params={accountId}
          />
        )}
        {accountId &&
        <QrDisplayAddress
          address={accountId}
          className={'qr-center'}
          genesisHash={api.genesisHash.toHex()}
          size={200}
        />
        }
      </div>
      {amount && accountBalance && amount.gtn(0) && accountBalance.gtn(0) &&
      <div className='ui placeholder segment'>
        <h2>{t('Enter the amount you would like to Nominate and click Start:')}</h2>
        <InputBalance
          defaultValue={amount}
          isFull
          isZeroable
          label={t('amount to bond')}
          maxValue={accountBalance}
          onChange={setAmountToNominate}
          withMax
        />
        <h4 className='ui orange header'>
          {t('Warning: After bonding, your funds will be locked and will remain locked after the nomination is stopped for')}
          <EraToTime showBlocks/>, {t('which is approximately')} <EraToTime showDays/>.
        </h4>
        <Button.Group>
          <Button
            icon='play'
            label={'Start'}
            onClick={startNomination}
          />
        </Button.Group>
      </div>
      }
      <div className='ui placeholder segment'>
        <Actions
          hideNewStake
          isInElection={isInElection}
          next={next}
          ownStashes={ownStashes}
          targets={targets}
          validators={validators}
        />
      </div>
    </main>
  );
}

export default React.memo(styled(Nomination)`
   max-width: 800px;
   
   .qr-center {
     margin: 0 auto;
   }
   
   .ui.header:before {
      display: none !important;
   }
`);
