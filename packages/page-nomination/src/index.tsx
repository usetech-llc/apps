// Copyright 2017-2020 @polkadot/app-nomination authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// global app props
import { AppProps as Props } from '@polkadot/react-components/types';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { ElectionStatus } from '@polkadot/types/interfaces';

// external imports (including those found in the packages/*
// of this repo)
import React, {useState, useCallback, useEffect} from 'react';
import BN from 'bn.js';
import styled from 'styled-components';
import { Button, HelpOverlay, InputBalance } from '@polkadot/react-components';
import basicMd from '@polkadot/app-staking/md/basic.md';
import {useApi, useCall, useOwnStashInfos, useStashIds} from '@polkadot/react-hooks';
import useValidators from '@polkadot/app-staking/Nomination/useValidators';
import { useTranslation } from '@polkadot/app-accounts/translate';
import { assert } from '@polkadot/util';
import { QrDisplayAddress } from '@polkadot/react-qr';
import Actions from '@polkadot/app-staking/Actions';
import useSortedTargets from '@polkadot/app-staking/useSortedTargets';

// local imports and components
import AccountSelector from './AccountSelector';
import WalletSelector from './WalletSelector';
import Available from './Available';

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
  const { filteredValidators, validatorsLoading } = useValidators();
  const [{ next, validators }, setValidators] = useState<Validators>({});
  const [accountId, setAccountId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [percent, setPercent] = useState(33);
  const [amount, setAmount] = useState<BN | undefined | null>(null);

  /* const nominate = useCallback(() => {
    api.api.tx.staking.nominate(filteredValidators).signAndSend(accountId, ({ events = [], status }) => {
      console.log('nominate Transaction status:', status.type);

      if (status.isInBlock) {
        console.log('nominate Included at block hash', status.asInBlock.toHex());
        console.log('nominate Events:');

        events.forEach(({ event: { data, method, section }, phase }) => {
          console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
        });
      } else if (status.isFinalized) {
        console.log('Finalized nominate', status.asFinalized.toHex());
        nominate();
      }
    });
  }, [accountId, amount, api.api.tx.staking]);

  const bond = useCallback(() => {
    api.api.tx.staking.bond(accountId, amount, 2).signAndSend(accountId, ({ events = [], status }) => {
      console.log('bond Transaction status:', status.type);

      if (status.isInBlock) {
        console.log('bond Included at block hash', status.asInBlock.toHex());
        console.log('bond Events:');

        events.forEach(({ event: { data, method, section }, phase }) => {
          console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
        });
      } else if (status.isFinalized) {
        console.log('Finalized bond', status.asFinalized.toHex());
        nominate();
      }
    });
  }, [accountId, amount, api.api.tx.staking]); */

  const startNomination = useCallback(() => {
    // bond();
    assert(false, 'Unable to find api.tx.');
  }, []);

  useEffect((): void => {
    allStashes && stakingOverview && setValidators({
      next: allStashes.filter((address) => !stakingOverview.validators.includes(address as any)),
      validators: stakingOverview.validators.map((a) => a.toString())
    });
  }, [allStashes, stakingOverview]);

  return (
    // in all apps, the main wrapper is setup to allow the padding
    // and margins inside the application. (Just from a consistent pov)
    <main className={`nomination-app ${className}`}>
      <HelpOverlay md={basicMd} />
      <div className='ui placeholder segment'>
        <WalletSelector
          onChange={setWallet}
          title={'Connect to a wallet'}
          value={wallet}
        />
      </div>
      <div className='ui placeholder segment'>
        <AccountSelector
          onChange={setAccountId}
          title={'Your account'}
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
      <div className='ui placeholder segment'>
        <h2>{t('Enter the amount you would like to Bond and click Start:')}</h2>
        <InputBalance
          isFull
          label={t('amount to bond')}
          onChange={setAmount}
        />
        <Button.Group>
          <Button
            icon='play'
            isDisabled
            label={'Start'}
            onClick={startNomination}
          />
        </Button.Group>
      </div>
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
      {/* <div className='ui placeholder segment'>
        <Button
          icon='add'
          label={'Just click to Nominate'}
          onClick={startNomination}
        />
        <Progress
          indicating
          percent={percent}
        />
        <div className='ui list'>
          <div className='item'>
            <div className='header'>Bond</div>
            <div className='description'>
              Bonding funds...
            </div>
          </div>
          <div className='item'>
            <div className='header'>Nominate</div>
            <div className='description'>
              Nominating...
            </div>
          </div>
        </div>
      </div> */}
    </main>
  );
}

export default React.memo(styled(Nomination)`
   max-width: 800px;
   
   .qr-center {
     margin: 0 auto;
   }
`);
