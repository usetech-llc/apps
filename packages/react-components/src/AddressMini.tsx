// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import BN from 'bn.js';
import React from 'react';
import { KeyringItemType } from '@polkadot/ui-keyring/types';

import { classes, toShortAddress } from './util';
import AccountName from './AccountName';
import IdentityIcon from './IdentityIcon';

interface Props {
  balance?: BN | BN[];
  bonded?: BN | BN[];
  children?: React.ReactNode;
  className?: string;
  iconInfo?: React.ReactNode;
  isHighlight?: boolean;
  isPadded?: boolean;
  isShort?: boolean;
  label?: React.ReactNode;
  labelBalance?: React.ReactNode;
  noLookup?: boolean;
  summary?: React.ReactNode;
  type?: KeyringItemType;
  value?: AccountId | AccountIndex | Address | string | null | Uint8Array;
  withAddress?: boolean;
  withBalance?: boolean;
  withBonded?: boolean;
  withLockedVote?: boolean;
  withSidebar?: boolean;
  withName?: boolean;
  withShrink?: boolean;
}

function AddressMini ({ balance, bonded, children, className = '', iconInfo, isHighlight, isPadded = true, label, labelBalance, noLookup, summary, value, withAddress = true, withBalance = false, withBonded = false, withLockedVote = false, withName = true, withShrink = false, withSidebar = true }: Props): React.ReactElement<Props> | null {
  if (!value) {
    return null;
  }

  return (
    <div className={classes('ui--AddressMini', isHighlight ? 'isHighlight' : '', isPadded ? 'padded' : '', withShrink ? 'withShrink' : '', className)}>
      {label && (
        <label className='ui--AddressMini-label'>{label}</label>
      )}
      <div className='ui--AddressMini-icon'>
        <IdentityIcon
          size={24}
          value={value as Uint8Array}
        />
        {iconInfo && (
          <div className='ui--AddressMini-icon-info'>
            {iconInfo}
          </div>
        )}
      </div>
      <div className='ui--AddressMini-info'>
        {withAddress && (
          <div className='ui--AddressMini-address'>
            {withName
              ? (
                <AccountName
                  noLookup={noLookup}
                  value={value}
                  withSidebar={withSidebar}
                />
              )
              : toShortAddress(value)
            }
          </div>
        )}
        {children}
      </div>
      {/* <div className='ui--AddressMini-balances'>
        {withBalance && (
          <BalanceDisplay
            balance={balance}
            label={labelBalance}
            params={value}
          />
        )}
        {withBonded && (
          <BondedDisplay
            bonded={bonded}
            label=''
            params={value}
          />
        )}
        {withLockedVote && (
          <LockedVote params={value} />
        )}
        {summary && (
          <div className='ui--AddressMini-summary'>{summary}</div>
        )}
      </div> */}
    </div>
  );
}

export default React.memo(AddressMini);
