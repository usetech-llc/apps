// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import { InputAddress, LabelHelp } from '@polkadot/react-components';

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
      <Header as='h2'>
        {title}
        <LabelHelp
          className='small-help'
          help={title}
        />
      </Header>
      <InputAddress
        className='small'
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

export default React.memo(AccountSelector);
/*
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
 */
