// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps } from '@polkadot/react-api/types';
import { DeriveBalancesAll } from '@polkadot/api-derive/types';
import { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import React from 'react';
import styled from 'styled-components';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import { useApi, useCall } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';
import {LabelHelp, Spinner} from '@polkadot/react-components';
import './Available.scss';

interface Props extends BareProps {
  label?: React.ReactNode;
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null;
}

function AvailableDisplay ({ className, label, params }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances.all, [params]);

  return (
    <div className={`${className as string}`}>
      {(!allBalances || !allBalances.availableBalance)
        ? <Spinner />
        : (
          <>
            <Header as={'h2'}>
              Your available balance:
              <LabelHelp
                className='small-help'
                help={'Free balance on this account'}
                description={
                  <div>
                    <p>
                      We will show you the balance on the chosen account available for nomination and
                      calculate and pre-fill the field for the amount of nomination with a maximum available
                      (some funds need to remain in the account for transaction fees).
                    </p>
                    <p>
                      Be aware – Kusama nomination can be stopped at any time, but after you do that, the network will take around 7 days to unbond your funds, during which you will not earn any income on them.
                    </p>
                  </div>
                }
              />
            </Header>
            <div className='value'>
              <FormatBalance
                className={className}
                label={label}
                value={allBalances ? allBalances.availableBalance : null}
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
