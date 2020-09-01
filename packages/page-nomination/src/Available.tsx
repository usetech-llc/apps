// Copyright 2017-2020 @polkadot/react-query authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps } from '@polkadot/react-api/types';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import React from 'react';
import styled from 'styled-components';
import { useApi, useCall } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';
import { Spinner } from '@polkadot/react-components';

import { useTranslation } from './translate';

interface Props extends BareProps {
  label?: React.ReactNode;
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null;
}

function AvailableDisplay ({ className, label, params }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { t } = useTranslation();
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances.all, [params]);

  return (
    <div className={`${className as string}`}>
      {(!allBalances || !allBalances.availableBalance)
        ? <Spinner />
        : (
          <>
            <div className={`${className as string} label`}>
              {t('Your available balance')}
            </div>
            <div className='value'>
              <FormatBalance
                className={className}
                label={label}
                value={allBalances?.availableBalance}
              />
            </div>
          </>
        )
      }
    </div>
  );
}

export default React.memo(styled(AvailableDisplay)`
  min-width: 100%;
  
  * {
    font-family: 'Roboto', sans-serif;
  }
  
  .ui.statistic > .value {
    line-height: inherit !important;
  }
  
  .qr-panel.label {
    font-family: 'Roboto', sans-serif;
    text-align: left;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    text-transform: none;
  } 
`);
