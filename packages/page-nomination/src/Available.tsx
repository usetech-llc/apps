// Copyright 2017-2020 @polkadot/react-query authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps } from '@polkadot/react-api/types';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import React from 'react';
import { useApi, useCall } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';
import { Spinner } from '@polkadot/react-components';
import {useTranslation} from "@polkadot/app-accounts/translate";

interface Props extends BareProps {
  children?: React.ReactNode;
  label?: React.ReactNode;
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null;
}

function AvailableDisplay ({ children, className, label, params }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { t } = useTranslation();
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances.all, [params]);

  if (!allBalances || !allBalances.availableBalance) {
    return (
      <div className='ui statistic'>
        <Spinner />
        <div className='label'>
          {t('Your account balance')}
        </div>
      </div>
    );
  }

  return (
    <div className='ui statistic'>
      <div className='value'>
        <FormatBalance
          className={className}
          label={label}
          value={allBalances?.availableBalance}
        />
      </div>
      <div className='label'>
        {t('Your account balance')}
      </div>
    </div>
  );
}

export default React.memo(AvailableDisplay);
