// Copyright 2017-2020 @polkadot/app-nomination authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useCallback } from 'react';
import BN from 'bn.js';
import { Progress } from 'semantic-ui-react';
// global app props
import { AppProps as Props } from '@polkadot/react-components/types';

// external imports (including those found in the packages/*
// of this repo)
import { Button, HelpOverlay, InputBalance } from '@polkadot/react-components';
import basicMd from '@polkadot/app-staking/md/basic.md';
import AccountSelector from '@polkadot/app-staking/Nomination/AccountSelector';
import { useApi } from '@polkadot/react-hooks';
import useValidators from '@polkadot/app-staking/Nomination/useValidators';
import Summary from '@polkadot/app-staking/Nomination/Summary';
import { useTranslation } from '@polkadot/app-accounts/translate';
import { Available } from '@polkadot/react-query/index';

// local imports and components

function Nomination ({ className }: Props): React.ReactElement<Props> {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [percent, setPercent] = useState(33);
  const [amount, setAmount] = useState<BN | undefined | null>(null);
  const api = useApi();
  const { filteredValidators, validatorsLoading } = useValidators();
  const { t } = useTranslation();

  function balanceWrapper (text: string): React.ReactNode {
    return (
      <strong className='label'>{text}</strong>
    );
  }

  const nominate = useCallback(() => {
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
  }, [accountId, amount, api.api.tx.staking]);

  const startNomination = useCallback(() => {
    bond();
  }, [bond]);

  return (
    // in all apps, the main wrapper is setup to allow the padding
    // and margins inside the application. (Just from a consistent pov)
    <main className={`nomination-app ${className}`}>
      <HelpOverlay md={basicMd} />
      <AccountSelector
        onChange={setAccountId}
        title={'Your account'}
        value={accountId}
      />
      <Available
        label={balanceWrapper(t('Your account balance'))}
        params={accountId}
      />
      <section>
        <h1>{t('Enter the amount you would like to Bond and click Next:')}</h1>
        <div className='ui--row'>
          <div className='large'>
            <InputBalance
              label={t('amount to bond')}
              onChange={setAmount}
            />
          </div>
          <Summary className='small'>{t('Bond to controller account. Bond fees and per-transaction fees apply and will be calculated upon submission.')}</Summary>
        </div>
      </section>
      <Button
        icon='add'
        label={'Just click to Nominate'}
        onClick={startNomination}
      />
      <div className='ui placeholder segment'>
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
      </div>
    </main>
  );
}

export default React.memo(Nomination);
