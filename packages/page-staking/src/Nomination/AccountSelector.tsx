// Copyright 2017-2020 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { InputAddress } from '@polkadot/react-components';

interface Props {
  value?: string | null;
  className?: string;
  title?: string;
  onChange: (accountId: string | null) => void;
}

function AccountSelector ({ className, onChange, title, value }: Props): React.ReactElement<Props> {
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect((): void => {
    if (accountId) {
      onChange(accountId);
    }
  }, [accountId, onChange, value]);

  return (
    <section className={className} >
      <h1>{title}</h1>
      <div className='ui--row'>
        <div className='large'>
          <InputAddress
            className='medium'
            defaultValue={value}
            label={`select ${title}`}
            onChange={setAccountId}
            type='account'
            value={value}
          />
        </div>
      </div>
    </section>
  );
}

export default React.memo(styled(AccountSelector)`
  align-items: flex-end;

  .summary {
    text-align: center;
  }
  
  .text-block {
    width: 50px !important;
    line-height: 60px;
    text-align: center;
    font-size: 16px;
  }
`);
