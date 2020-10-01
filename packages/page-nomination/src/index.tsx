// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// global app props
import { AppProps as Props } from '@polkadot/react-components/types';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { ValidatorInfo } from '@polkadot/app-nomination/types';
import { ActionStatus, QueueAction$Add, QueueStatus, QueueTx } from '@polkadot/react-components/Status/types';

// external imports (including those found in the packages/*
// of this repo)
import React, { useState, useCallback, useEffect } from 'react';
import BN from 'bn.js';
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';
import { useApi, useCall, useOwnStashInfos } from '@polkadot/react-hooks';
import keyring from '@polkadot/ui-keyring';
import { web3FromSource, web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import uiSettings from '@polkadot/ui-settings';

// local imports and components
import NewNomination from './containers/NewNomination';
import { useTranslation } from './translate';
import Status from './components/Status';
import ManageNominations from './containers/ManageNominations';
import useValidators from './hooks/useValidators';

declare global {
  interface Window {
    injectedWeb3: any;
  }
}

interface AppProps {
  basePath: string;
  className?: string;
  onStatusChange: (status: ActionStatus) => void;
  queueAction: QueueAction$Add;
  stqueue: QueueStatus[];
  txqueue: QueueTx[];
}

function Nomination ({ className, queueAction, stqueue, txqueue }: AppProps): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [web3Enabled, setWeb3Enabled] = useState<boolean>(false);
  const [amountToNominate, setAmountToNominate] = useState<BN | undefined | null>(null);
  const ownStashes = useOwnStashInfos();
  const history = useHistory();
  const stakingOverview = useCall<DeriveStakingOverview>(api.derive.staking.overview, []);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accountsAvailable, setAccountsAvailable] = useState<boolean>(false);
  const [ksi, setKsi] = useState<number>(5);
  const {
    filteredValidators,
    nominationServerAvailable,
    validatorsLoading,
  } = useValidators(ksi);
  const [optimalValidators, setOptimalValidators] = useState<ValidatorInfo[]>([]);
  const [settings] = useState(uiSettings.get());
  const isKusama = uiSettings && uiSettings.apiUrl.includes('kusama');

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

    const injected = await web3FromSource(source as string);
    console.log('injected.signer', injected.signer);
    api.setSigner(injected.signer);
  }, [accountId, api]);

  const onSetKsi = useCallback((ksi: Array<number>) => {
    setKsi(ksi[0]);
  }, [setKsi]);

  useEffect((): void => {
    if (!accountId) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setSigner().then();
  }, [accountId, setSigner]);

  useEffect(() => {
    // initialize wallet
    if (ownStashes) {
      if (ownStashes.length) {
        history.push('/manage');
      } else {
        history.push('new');
      }
    }
  }, [ownStashes]);

  useEffect((): void => {
    web3Enable('').then((res) => {
      setWeb3Enabled(!!res.length);
    });

    web3Accounts().then((res) => {
      setAccountsAvailable(!!res.length);
    });
  }, []);

  useEffect((): void => {
    // set settings to Kusama
    const newApiUrl = 'wss://kusama-rpc.polkadot.io/';

    uiSettings.set({ ...settings, apiUrl: newApiUrl });
    console.log('settings.apiUrl', settings.apiUrl);
    if (settings.apiUrl !== newApiUrl) {
      window.location.reload();
    }
  }, [settings]);

  // if we have problems with server - we should use client elected info and filter
  useEffect(() => {
    if (filteredValidators && filteredValidators.length && !validatorsLoading) {
      setOptimalValidators(filteredValidators);
    }
  }, [filteredValidators, validatorsLoading]);

  return (
    // in all apps, the main wrapper is setup to allow the padding
    // and margins inside the application. (Just from a consistent pov)
    <main className={`nomination-app ${className || ''}`}>
      { status === 'none' && (
        <div className='error-block'>
          {t('Error: You have no polkadot extension injected.')}
        </div>
      )}
      <Switch>
        <Route
          exact
          key='newNomination'
          path='/new'
          render={() => (
            <NewNomination
              accountId={accountId}
              accountsAvailable={accountsAvailable}
              amountToNominate={amountToNominate}
              ksi={ksi}
              nominationServerAvailable={nominationServerAvailable}
              ownStashes={ownStashes}
              optimalValidators={optimalValidators}
              setAccountId={setAccountId}
              setKsi={onSetKsi}
              setAmountToNominate={setAmountToNominate}
              stakingOverview={stakingOverview}
              web3Enabled={web3Enabled}
              queueAction={queueAction}
              validatorsFromServerLoading={validatorsLoading}
            />
          )}
        />
        <Route
          exact
          key='manageNominations'
          path='/manage'
          render={() => (
            <ManageNominations
              isKusama={isKusama}
              ksi={ksi}
              setKsi={onSetKsi}
              nominationServerAvailable={nominationServerAvailable}
              ownStashes={ownStashes}
              optimalValidators={optimalValidators}
              queueAction={queueAction}
              setAccountId={setAccountId}
              stakingOverview={stakingOverview}
              validatorsFromServerLoading={validatorsLoading}
            />
          )}
        />
        <Redirect to={'new'} />
      </Switch>
      <Status
        queueAction={queueAction}
        stqueue={stqueue}
        txqueue={txqueue}
      />
    </main>
  );
}

export default React.memo(Nomination);
