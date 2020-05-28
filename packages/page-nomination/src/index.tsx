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
import React, { useState, useCallback, useEffect, useRef, useContext, Suspense } from 'react';
import BN from 'bn.js';
import styled from 'styled-components';
import { Button, HelpOverlay, StatusContext, Spinner } from '@polkadot/react-components';
import basicMd from '@polkadot/app-staking/md/basic.md';
import { useApi, useCall, useOwnStashInfos, useStashIds } from '@polkadot/react-hooks';
import { QrDisplayAddress } from '@polkadot/react-qr';
import keyring from '@polkadot/ui-keyring';
import { web3FromSource, web3Accounts, web3Enable } from '@polkadot/extension-dapp';

// local imports and components
import AccountSelector from './AccountSelector';
import EraToTime from './EraToTime';
import Available from './Available';
import useValidators from './useValidators';
import WalletSelector from './WalletSelector';
import InputBalance from './InputBalance';
import { useFees, WholeFeesType, useBalanceClear } from './useBalance';
import { useTranslation } from './translate';

const Actions = React.lazy(() => import('./Actions'));

interface Validators {
  next?: string[];
  validators?: string[];
}

function Nomination ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const ownStashes = useOwnStashInfos();
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
  const [web3Enabled, setWeb3Enabled] = useState<boolean>(false);
  const [accountsAvailable, setAccountsAvailable] = useState<boolean>(false);
  const [startButtonDisabled, setStartButtonDisabled] = useState<boolean>(false);
  const [isNominating, setIsNominating] = useState<boolean>(false);
  const [amountToNominate, setAmountToNominate] = useState<BN | undefined>(new BN(0));
  const [balanceInitialized, setBalanceInitialized] = useState<boolean>(false);
  const accountSegment: any = useRef(null);
  const accountBalance: Balance | null = useBalanceClear(accountId);
  const { wholeFees }: WholeFeesType = useFees(accountId, selectedValidators);
  const { queueAction } = useContext(StatusContext);
  const currentAccountRef = useRef<string | null>();
  const extrinsicBond = (amountToNominate && accountId)
    ? api.tx.staking.bond(accountId, amountToNominate, 2)
    : null;
  const extrinsicNominate = (amountToNominate && accountId)
    ? api.tx.staking.nominate(selectedValidators)
    : null;

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

  const startNomination = useCallback(() => {
    if (!extrinsicBond || !extrinsicNominate || !accountId) {
      return;
    }

    const txs = [extrinsicBond, extrinsicNominate];

    setIsNominating(true);
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
          setIsNominating(false);
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

  const disableStartButton = useCallback(() => {
    if (!ownStashes) {
      return;
    }

    const currentStash = ownStashes.find((stash) => stash.stashId === accountId);

    setStartButtonDisabled(!!currentStash);
  }, [accountId, ownStashes]);

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
  }, [calculateMaxPreFilledBalance]);

  useEffect(() => {
    disableStartButton();
  }, [disableStartButton]);

  // nominate amount initialization
  useEffect(() => {
    setBalanceInitialized(true);
  }, [amount]);

  // show notification when change account
  useEffect(() => {
    if (currentAccountRef.current && currentAccountRef.current !== accountId) {
      const message: ActionStatus = {
        action: 'account changed',
        message: t('Account was changed!'),
        status: 'success'
      };

      queueAction([message]);
    }

    currentAccountRef.current = accountId;
  }, [accountId, t, queueAction]);

  useEffect(() => {
    if (accountSegment && accountSegment.current) {
      window.scrollTo(0, accountSegment.current.offsetTop);
    }

    web3Enable('').then((res) => {
      setWeb3Enabled(!!res.length);
    });

    web3Accounts().then((res) => {
      setAccountsAvailable(!!res.length);
    });
  }, []);

  return (
    // in all apps, the main wrapper is setup to allow the padding
    // and margins inside the application. (Just from a consistent pov)
    <main className={`nomination-app ${className}`}>
      <HelpOverlay md={basicMd} />
      <div className='ui placeholder segment'>
        <h2>{t('Step {{stepNumber}}', { replace: { stepNumber: 1 } })}</h2>
        <br />
        <WalletSelector
          onChange={setWallet}
          title={t('Connect to a wallet')}
          value={wallet}
        />
        {!web3Enabled &&
        <h4 className='ui orange header'>{t('Please enable the polkadot.js extension!')}</h4>
        }
        {(web3Enabled && !accountsAvailable) &&
        <h4 className='ui orange header'>{t('You have no accounts in polkadot.js extension. Please create account and send funds to it.')}</h4>
        }
      </div>
      { web3Enabled && (
        <div
          className='ui placeholder segment'
          ref={accountSegment}
        >
          <h2>{t('Step {{stepNumber}}', { replace: { stepNumber: 2 } })}</h2>
          <br />
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
          {amount && !amount.gtn(0) &&
          <h4 className='ui red header text-center'>{t('Your account`s balance is insufficient for nomination')}</h4>
          }
        </div>
      )}
      {amount && accountBalance && amount.gtn(0) && accountBalance.gtn(0) &&
      <div className='ui placeholder segment'>
        <h2>{t('Step {{stepNumber}}', { replace: { stepNumber: 3 } })}</h2>
        <br />
        <h2>{t('Enter the amount you would like to Nominate and click Start:')}</h2>
        { balanceInitialized && (
          <InputBalance
            defaultValue={amount}
            isDecimal
            isFull
            isZeroable
            label={t('amount to bond')}
            maxValue={amount}
            onChange={setAmountToNominate}
            withMax
          />
        )}
        <h4 className='ui orange header'>
          {t('Warning: After bonding, your funds will be locked and will remain locked after the nomination is stopped for')}
          <EraToTime showBlocks/>, {t('which is approximately')} <EraToTime showDays/>.
        </h4>
        <Button.Group>
          <Button
            icon='play'
            isDisabled={startButtonDisabled}
            isLoading={isNominating}
            label={'Start'}
            onClick={startNomination}
          />
        </Button.Group>
      </div>
      }
      { accountId && (
        <div className='ui placeholder segment'>
          <h2>{t('Step {{stepNumber}}', { replace: { stepNumber: 4 } })}</h2>
          <br />
          <Suspense fallback={<Spinner />}>
            <Actions
              hideNewStake
              isInElection={isInElection}
              next={next}
              ownStashes={ownStashes}
              selectedValidators={selectedValidators}
              validators={validators}
            />
          </Suspense>
        </div>
      )}
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

   .text-center {
      text-align: center;
   }
`);
