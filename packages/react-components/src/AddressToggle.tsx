// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveAccountInfo } from '@polkadot/api-derive/types';

import React, { useCallback, useEffect, useState } from 'react';
import { useApi, useCall } from '@polkadot/react-hooks';

import { getAddressName } from './util';
import AddressMini from './AddressMini';
import Toggle from './Toggle';
import './addressToggle.styles.scss';

interface Props {
  address: string;
  className?: string;
  isHidden?: boolean;
  filter?: string;
  noLookup?: boolean;
  noToggle?: boolean;
  onChange?: (isChecked: boolean) => void;
  value?: boolean;
}

function getIsFiltered (address: string, filter?: string, info?: DeriveAccountInfo): boolean {
  if (!filter || address.includes(filter)) {
    return false;
  }

  const [,, extracted] = getAddressName(address);
  const filterLower = filter.toLowerCase();

  if (extracted.toLowerCase().includes(filterLower)) {
    return false;
  }

  if (info) {
    const { accountId, accountIndex, identity, nickname } = info;

    if (identity.display?.toLowerCase().includes(filterLower) || accountId?.toString().includes(filter) || accountIndex?.toString().includes(filter) || nickname?.toLowerCase().includes(filterLower)) {
      return false;
    }
  }

  return true;
}

function AddressToggle ({ address, className = '', filter, isHidden, noLookup, noToggle, onChange, value }: Props): React.ReactElement<Props> | null {
  const { api } = useApi();
  const info = useCall<DeriveAccountInfo>(!noLookup && api.derive.accounts.info, [address]);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect((): void => {
    setIsFiltered(getIsFiltered(address, filter, info));
  }, [address, filter, info]);

  const _onClick = useCallback(
    (): void => onChange && onChange(!value),
    [onChange, value]
  );

  return (
    <div
      className={`ui--AddressToggle ${className}${(value || noToggle) ? ' isAye' : ' isNay'}${isHidden || isFiltered ? ' isHidden' : ''}`}
      onClick={_onClick}
    >
      <AddressMini
        className='ui--AddressToggle-address'
        noLookup={noLookup}
        value={address}
        withSidebar={false}
      />
      {!noToggle && (
        <div className='ui--AddressToggle-toggle'>
          <Toggle
            label=''
            value={value}
          />
        </div>
      )}
    </div>
  );
}

export default React.memo(AddressToggle);
