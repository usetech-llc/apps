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
import { Button, StatusContext, Spinner } from '@polkadot/react-components';
import { useApi, useCall, useOwnStashInfos, useStashIds } from '@polkadot/react-hooks';
import keyring from '@polkadot/ui-keyring';
import { web3FromSource, web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import uiSettings from '@polkadot/ui-settings';

// local imports and components
import AccountSection from './AccountSection';
import QrSection from './QrSection';
import useValidators from './useValidators';
import { useSlashes } from './useShalses';
import WalletSelector from './WalletSelector';
import BondSection from './BondSection';
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
  const [wallet, setWallet] = useState<string | null>(null);
  const [web3Enabled, setWeb3Enabled] = useState<boolean>(false);
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
  const [amount, setAmount] = useState<BN | undefined>(new BN(0));
  const [accountsAvailable, setAccountsAvailable] = useState<boolean>(false);
  const [stashIsCurrent, setStashIsCurrent] = useState<boolean>(false);
  const [isNominating, setIsNominating] = useState<boolean>(false);
  const [amountToNominate, setAmountToNominate] = useState<BN | undefined>(new BN(0));
  const [balanceInitialized, setBalanceInitialized] = useState<boolean>(false);
  const accountBalance: Balance | null = useBalanceClear(accountId);
  const { wholeFees }: WholeFeesType = useFees(accountId, selectedValidators);
  const { queueAction } = useContext(StatusContext);
  const currentAccountRef = useRef<string | null>();
  const slashes = useSlashes(accountId);
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

  const setSigner = useCallback(async (): Promise<void> => {
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
    console.log('currentStash', !!currentStash);
    setStashIsCurrent(!!currentStash);
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

  useEffect((): void => {
    if (!accountId) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
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

  useEffect((): void => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    web3Enable('').then((res) => {
      setWeb3Enabled(!!res.length);
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    web3Accounts().then((res) => {
      setAccountsAvailable(!!res.length);
    });
  }, []);

  const isKusama = uiSettings && uiSettings.apiUrl.includes('kusama');

  return (
    // in all apps, the main wrapper is setup to allow the padding
    // and margins inside the application. (Just from a consistent pov)
    <main className={`nomination-app ${className || ''}`}>
      <div className='ui placeholder segment'>
        <div className='nomination-row'>
          <div className='left'>
            <h1>{t('Your account')}</h1>
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
        <div className='nomination-active'>
          { accountId && (
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
          )}
        </div>
      </div>
    </main>
  );
}

export default React.memo(styled(Nomination)`
   max-width: 800px;
   
   .nomination-row {
      display: grid;
      grid-template-columns: 500px 210px;
      grid-column-gap: 32px;
   }

   .qr-center {
     margin: 0 auto;
   }

   .ui.header:before {
      display: none !important;
   }

   .text-center {
      text-align: center;
   }
   
   .telegram-img {
      width: 30px;
      height: 30px;
   }
   
   .icon.success {
      font-size: 22px;
   }
   
   .error-block {
      background: #F8EFEF;
      border: 1px solid rgba(202, 20, 20, 0.2);
      border-radius: 4px;
      text-align: center;
      color: #CA1414;
      font-size: 12px;
      line-height: 24px;
      margin: 5px 0;
      padding: 8px 16px;
   }
   
   .warning-block {
      background: #F7F2EE;
      border: 1px solid rgba(202, 96, 20, 0.2);
      box-sizing: border-box;
      border-radius: 4px;
      margin: 5px 0;
      font-size: 12px;
      line-height: 24px;
      padding: 8px 16px;
   }
   
   section {
      margin: 8px 0;
   }
   
   .header-qr {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30px;  
   }
   
   .close-window {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 24px;
      color: #464E5F;
   }
   
   .account-panel, .bond-section-block {
      background: white;
      border: 1px solid #DDDDDD;
      box-sizing: border-box;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      padding: 24px;
   }
   
   .account-panel {
       text-align: center;
   }
`);
