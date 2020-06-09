// Copyright 2017-2020 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { InputAddress } from '@polkadot/react-components';

// import { useTranslation } from './translate';

interface Props {
  value?: string | null;
  className?: string;
  title?: string;
  onChange: (accountId: string | null) => void;
}

function AccountSelector ({ className, onChange, title, value }: Props): React.ReactElement<Props> {
  const [accountId, setAccountId] = useState<string | null>(null);
  // const { t } = useTranslation();

  useEffect((): void => {
    if (accountId) {
      onChange(accountId);
    }
  }, [accountId, onChange, value]);

  return (
    <div className={className} >
      <h2>{title}</h2>
      <InputAddress
        className='medium'
        defaultValue={value}
        onChange={setAccountId}
        type='account'
        value={value}
      />
      {/* <Button.Group>
        <Button
          icon='arrow up'
          isDisabled
          label={t('Import')}
        />
        <div className='or'/>
        <Button
          icon='add'
          isDisabled
          label={t('Create New')}
        />
      </Button.Group> */}
    </div>
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
