// Copyright 2020 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveStakingQuery, DeriveEraPoints } from '@polkadot/api-derive/types';

import React, { useEffect, useState } from 'react';
import BN from 'bn.js';
import { AddressMini } from '@polkadot/react-components';
import { useApi, useCall } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';
import { formatNumber } from '@polkadot/util';

interface Props {
  erasPoints?: DeriveEraPoints[];
  validatorId: string;
}

interface StakingState {
  commission?: string;
  stakeTotal?: BN;
  stakeOther?: BN;
  stakeOwn?: BN;
}

const PERBILL_PERCENT = 10_000_000;

function expandInfo ({ exposure, validatorPrefs }: DeriveStakingQuery): StakingState {
  let stakeTotal: BN | undefined;
  let stakeOther: BN | undefined;
  let stakeOwn: BN | undefined;

  if (exposure) {
    stakeTotal = exposure.total.unwrap();
    stakeOwn = exposure.own.unwrap();
    stakeOther = stakeTotal.sub(stakeOwn);
  }

  const commission = (validatorPrefs && validatorPrefs.commission) ? validatorPrefs.commission.unwrap() : new BN(0);

  return {
    commission: commission
      ? `${(commission.toNumber() / PERBILL_PERCENT).toFixed(2)}%`
      : undefined,
    stakeOther,
    stakeOwn,
    stakeTotal
  };
}

function NominatorRow (props: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { erasPoints, validatorId } = props;
  const stakingInfo = useCall<DeriveStakingQuery>(api.derive.staking.query, [validatorId]);
  const [{ commission, stakeOther, stakeOwn }, setStakingState] = useState<StakingState>({});
  const [points, setPoints] = useState<BN>(new BN(0));

  useEffect((): void => {
    stakingInfo && setStakingState(expandInfo(stakingInfo));
  }, [stakingInfo]);

  useEffect(() => {
    const validatorPoints = erasPoints && erasPoints.map((era: any) => era.validators[validatorId]);
    if (validatorPoints && validatorPoints[0]) {
      setPoints(validatorPoints[0]);
    }
  }, [erasPoints, validatorId]);

  return (
    <div className='account-block' key={validatorId}>
      <AddressMini
        value={validatorId}
        withBonded
      />
      <div className='other-stake'>
        <FormatBalance
          value={stakeOther}
        />
      </div>
      <div className='own-stake'>
        <FormatBalance
          value={stakeOwn}
        />
      </div>
      <div className='commission'>
        {commission}
      </div>
      <div className='points'>
        {formatNumber(points)}
      </div>
    </div>
  )
}

export default React.memo(NominatorRow);
