// Copyright 2017-2020 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { InputAddress } from '@polkadot/react-components';
import { useBalanceClear } from '@polkadot/app-staking/Nomination/useBalance';
import { useApi } from '@polkadot/react-hooks';

interface Props {
  value?: string | null;
  className?: string;
  title?: string;
  onChange: (accountId: string | null) => void;
  setControllerAccountId: (controllerId: string | null) => void;
  setStepsState: (stepsState: string[]) => void; // Dispatch<SetStateAction<string>>
  stepsState: string[];
}

function AccountSelector ({ className, onChange, setControllerAccountId, setStepsState, stepsState, title, value }: Props): React.ReactElement<Props> {
  const [accountId, setAccountId] = useState<string | null>(null);
  const balance = useBalanceClear(accountId);
  const api = useApi();
  const existentialDeposit = api.api.consts.balances.existentialDeposit;

  useEffect((): void => {
    if (accountId) {
      if (value !== accountId) {
        setControllerAccountId(null);
      }

      onChange(accountId);
    }
  }, [accountId, onChange, setControllerAccountId, value]);

  useEffect(() => {
    const newStepsState = [...stepsState];

    if (balance === null) {
      return;
    }

    if (balance.cmp(existentialDeposit) === 1) {
      newStepsState[0] = 'completed';
      newStepsState[1] = newStepsState[1] === 'disabled' ? '' : newStepsState[1];
    } else {
      newStepsState[0] = '';
      newStepsState[1] = 'disabled';
      newStepsState[2] = 'disabled';
      newStepsState[3] = 'disabled';
    }

    setStepsState(newStepsState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, existentialDeposit]);

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
