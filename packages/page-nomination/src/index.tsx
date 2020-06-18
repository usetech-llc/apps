// Copyright 2017-2020 @polkadot/app-nomination authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// global app props
import { AppProps as Props } from '@polkadot/react-components/types';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { ActionStatus, QueueAction$Add, QueueStatus, QueueTx } from '@polkadot/react-components/Status/types';

// external imports (including those found in the packages/*
// of this repo)
import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useApi, useCall, useOwnStashInfos, useStashIds } from '@polkadot/react-hooks';
import keyring from '@polkadot/ui-keyring';
import { web3FromSource, web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import uiSettings from '@polkadot/ui-settings';

// local imports and components
import NewNomination from './NewNomination';
import { useTranslation } from './translate';
import Status from './Status';
import ManageNominations from './ManageNominations';
import {Spinner} from "@polkadot/react-components/index";

interface Validators {
  next?: string[];
  validators?: string[];
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
  const [wallet, setWallet] = useState<string | null>(null);
  const [web3Enabled, setWeb3Enabled] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const ownStashes = useOwnStashInfos();
  const allStashes = useStashIds();
  const stakingOverview = useCall<DeriveStakingOverview>(api.derive.staking.overview, []);
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const [{ next, validators }, setValidators] = useState<Validators>({});
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accountsAvailable, setAccountsAvailable] = useState<boolean>(false);
  // const { wholeFees }: WholeFeesType = useFees(accountId, selectedValidators);
  const currentAccountRef = useRef<string | null>();
  const isKusama = uiSettings && uiSettings.apiUrl.includes('kusama');
  const nominationStatus = localStorage.getItem('nominationStatus');

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

  const toNomination = useCallback(() => {
    setStatus('manage');
    localStorage.removeItem('nominationStatus');
  }, []);

  const backToWallet = useCallback(() => {
    setStatus('new');
    localStorage.setItem('nominationStatus', 'new');
  }, []);

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

  useEffect(() => {
    // initialize wallet
    if (ownStashes) {
      if (ownStashes.length && !nominationStatus) {
        setStatus('manage');
      } else {
        setStatus('new');
      }
    }
  }, [ownStashes, nominationStatus]);

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

  return (
    // in all apps, the main wrapper is setup to allow the padding
    // and margins inside the application. (Just from a consistent pov)
    <main className={`nomination-app ${className || ''}`}>
      <div className='ui placeholder segment'>
        { !status && (
          <Spinner label={t<string>('Initializing wallet')} />
        )}
        { status === 'new' && (
          <NewNomination
            accountId={accountId}
            accountsAvailable={accountsAvailable}
            isKusama={isKusama}
            ownStashes={ownStashes}
            queueAction={queueAction}
            selectedValidators={selectedValidators}
            setAccountId={setAccountId}
            setSelectedValidators={setSelectedValidators}
            setWallet={setWallet}
            stakingOverview={stakingOverview}
            toNomination={toNomination}
            wallet={wallet}
            web3Enabled={web3Enabled}
          />
        )}
        { status === 'manage' && (
          <ManageNominations
            accountId={accountId}
            backToWallet={backToWallet}
            isKusama={isKusama}
            next={next}
            ownStashes={ownStashes}
            selectedValidators={selectedValidators}
            validators={validators}
          />
        )}
      </div>
      <Status
        queueAction={queueAction}
        stqueue={stqueue}
        txqueue={txqueue}
      />
    </main>
  );
}

export default React.memo(styled(Nomination)`
   max-width: 800px;
   position: relative;
   
   .nomination-row {
      display: grid;
      grid-template-columns: 500px 210px;
      grid-column-gap: 32px;
   }
   
   .manage-nomination-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-column-gap: 32px;
      
      .right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
   }
   
   .help-button-block {
      margin-left: 16px;
   }
   
   .telegram-notification {
      background-color: #0087cb;
      border-radius: 4px;
      padding: 0 10px;
      color: white;
      display: block;
      height: 24px;
      
      img {
        width: 24px;
        height: 24px;
        vertical-align: middle;
      }
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
      justify-content: flex-end;
      margin-bottom: 30px;  
   }
   
   .close-window {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 24px;
      color: #464E5F;
      margin-left: 28px;
   }
   
   .bond-section {
      margin-bottom: 20px;
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
   
   .button.back {
      float: left;
   }
   
   .nomination-active {
      .button.back {
        margin-top: 26px;
      }
   }
   
   .divider {
      width: 100%;
      height: 1px;
      background-color: #D5D5D5;
      margin-bottom: 16px;
  }
`);
