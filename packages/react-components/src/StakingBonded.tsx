// Copyright 2017-2020 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DeriveStakingAccount } from '@polkadot/api-derive/types';

import React from 'react';
import { FormatBalance } from '@polkadot/react-query';

interface Props {
  className?: string;
  stakingInfo?: DeriveStakingAccount;
  withLabel?: string;
}

function StakingBonded ({ className = '', stakingInfo, withLabel }: Props): React.ReactElement<Props> | null {
  const balance = stakingInfo?.stakingLedger?.active.unwrap();

  if (!balance?.gtn(0)) {
    return null;
  }

  if (withLabel) {
    return (
      <>
        <FormatBalance
          className={className}
          value={balance}
        />
        <span className='small'>{withLabel}</span>
      </>
    );
  }

  return (
    <FormatBalance
      className={className}
      value={balance}
    />
  );
}

export default React.memo(StakingBonded);
