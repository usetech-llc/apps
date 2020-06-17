// Copyright 2017-2020 @polkadot/react-query authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps } from '@polkadot/react-api/types';

import BN from 'bn.js';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Compact } from '@polkadot/types';
import { formatBalance } from '@polkadot/util';

import { useTranslation } from './translate';

interface Props extends BareProps {
  children?: React.ReactNode;
  isShort?: boolean;
  label?: React.ReactNode;
  labelPost?: React.ReactNode;
  value?: Compact<any> | BN | string | null | 'all';
  withSi?: boolean;
}

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1;
const K_LENGTH = 3 + 1;

function format (value: Compact<any> | BN | string, currency: string, withSi?: boolean, _isShort?: boolean): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, { forceUnit: '-', withSi: false }).split('.');
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH);

  if (prefix.length > M_LENGTH) {
    // TODO Format with balance-postfix
    return formatBalance(value);
  }

  return <>{prefix}{!isShort && (<>.<span className='ui--FormatBalance-postfix'>{`000${postfix || ''}`.slice(-3)}</span></>)} <span className='currency'>{currency}</span></>;
}

function FormatBalance ({ children, className, isShort, label, labelPost, value, withSi }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [currency] = useState(formatBalance.getDefaults().unit);

  return (
    <div className={`ui--FormatBalance ${className}`}>
      {label || ''}
      <span className={`ui--FormatBalance-value ${className}`}>
        { value
          ? value === 'all' ? t('everything') : format(value, currency, withSi, isShort) : '-'
        }
      </span>
      <span className='ui--FormatBalance-label'>{labelPost}{children}</span>
    </div>
  );
}

export default React.memo(styled(FormatBalance)`
  display: inline-block;
  vertical-align: baseline;
  white-space: nowrap;

  * {
    vertical-align: baseline !important;
     font-family: 'Roboto', sans-serif;
  }

  > label,
  > .label {
    display: inline-block;
    margin-right: 0.25rem;
    vertical-align: baseline;
  }
  
  .qr-panel.value {
     line-height: inherit;
  }
  
  .qr-panel.ui--FormatBalance-value {
   text-align: left;
    font-weight: bold;
    font-size: 30px;
    line-height: 60px;
  }
  
  .qr-panel.ui--FormatBalance-value > .currency {
    font-size: 20px;
    line-height: 30px;
    font-weight: normal;
  }
  
  .qr-panel .ui--FormatBalance-postfix {
      font-weight: bold;
      font-size: 30px;
      line-height: 60px;
  }
  
  .ui--FormatBalance-label {
      font-family: 'Roboto', sans-serif;
      font-style: normal;
      font-weight: normal;
      font-size: 20px;
      line-height: 30px;
  }

  .ui--FormatBalance-value {
    text-align: right;
  }
`);
