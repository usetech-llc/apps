// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';
import BN from 'bn.js';
import AccountSelector from '@polkadot/app-nomination/AccountSelector';

import { useTranslation } from './translate';

interface Props {
  setAccountId: (accountId: string | null) => void;
  accountId: string | null;
  accountsAvailable: boolean;
  amount: BN | undefined;
}

function AccountSection ({ accountId, accountsAvailable, amount, setAccountId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  return (
    <section className='account-section'>
      <AccountSelector
        onChange={setAccountId}
        title={t('Select your account:')}
        value={accountId}
      />
      {!accountsAvailable &&
      <div className='error-block'>{t('You have no accounts in polkadot.js extension. Please create account and send funds to it.')}</div>
      }
      {amount && !amount.gtn(0) &&
      <div className='error-block'>{t('Your account`s balance is insufficient for nomination')}</div>
      }
    </section>
  );
}

export default React.memo(styled(AccountSection)``);
