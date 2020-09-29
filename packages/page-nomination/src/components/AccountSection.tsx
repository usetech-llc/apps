// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';

import AccountSelector from './AccountSelector';
import Available from './Available';

interface Props {
  setAccountId: (accountId: string | null) => void;
  accountId: string | null;
  accountsAvailable: boolean;
}

function AccountSection ({ accountId, accountsAvailable, setAccountId }: Props): React.ReactElement<Props> {

  return (
    <section className='account-section'>
      <AccountSelector
        onChange={setAccountId}
        title={'Select your account:'}
        value={accountId}
      />
      {(!accountsAvailable && !accountId) &&
      <div className='error-block'>You have no accounts in polkadot.js extension. Please create account and send funds to it.</div>
      }
      <div className='divider' />
      {accountId && (
        <Available
          className='available-balance'
          params={accountId}
        />
      )}
    </section>
  );
}

export default React.memo(styled(AccountSection)``);
