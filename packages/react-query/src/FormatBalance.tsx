// Copyright 2017-2020 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import React from 'react';
import { Compact } from '@polkadot/types';
import { formatBalance } from '@polkadot/util';

import { useTranslation } from './translate';

interface Props {
  children?: React.ReactNode;
  className?: string;
  isShort?: boolean;
  label?: React.ReactNode;
  labelPost?: string;
  value?: Compact<any> | BN | string | null | 'all';
  withCurrency?: boolean;
  withSi?: boolean;
}

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1;
const K_LENGTH = 3 + 1;

function format (value: Compact<any> | BN | string, withCurrency = true, withSi?: boolean, _isShort?: boolean, labelPost?: string): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, { forceUnit: '-', withSi: false }).split('.');
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH);
  const unitPost = withCurrency ? formatBalance.getDefaults().unit : '';

  if (prefix.length > M_LENGTH) {
    const [major, rest] = formatBalance(value, { withUnit: false }).split('.');
    const minor = rest.substr(0, 4);
    const unit = rest.substr(4);

    return <>{major}.<span className='ui--FormatBalance-postfix'>{minor}</span><span className='ui--FormatBalance-unit'>{unit}{unit ? unitPost : ` ${unitPost}`}</span>{labelPost || ''}</>;
  }

  return <>{`${prefix}${isShort ? '' : '.'}`}{!isShort && <span className='ui--FormatBalance-postfix'>{`0000${postfix || ''}`.slice(-4)}</span>}<span className='ui--FormatBalance-unit'> {unitPost}</span>{labelPost || ''}</>;
}

function FormatBalance ({ children, className = '', isShort, label, labelPost, value, withCurrency, withSi }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  // labelPost here looks messy, however we ensure we have one less text node
  return (
    <div className={`ui--FormatBalance ${className}`}>
      {label || ''}<span className='ui--FormatBalance-value'>{
        value
          ? value === 'all'
            ? t<string>('everything{{labelPost}}', { replace: { labelPost } })
            : format(value, withCurrency, withSi, isShort, labelPost)
          : `-${labelPost || ''}`
      }</span>{children}
    </div>
  );
}

export default React.memo(FormatBalance);
