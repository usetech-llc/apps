// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { DeriveSessionProgress } from '@polkadot/api-derive/types';

import React from 'react';
import styled from 'styled-components';
import BN from 'bn.js';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import { LabelHelp } from '@polkadot/react-components';
import { useApi, useBlockTime, useCall } from '@polkadot/react-hooks';
import { formatNumber } from '@polkadot/util';

import InputBalance from './InputBalance';

interface Props {
  amountToNominate: BN | undefined | null;
  maxAmountToNominate: null | undefined | BN;
  setAmountToNominate: (amount: BN | undefined) => void;
}

function BondSection ({ amountToNominate, maxAmountToNominate, setAmountToNominate }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const progress = useCall<DeriveSessionProgress>(api.derive.session.progress, []);
  const bondedDuration = api.consts.staking.bondingDuration;
  const eraLength = progress && progress.eraLength ? progress.eraLength.toBn().mul(bondedDuration) : new BN(0);
  const [, text] = useBlockTime(eraLength);

  return (
    <section className='bond-section'>
      <div className='bond-section-block'>
        <Header as='h2'>
          Amount to bond and nominate:
          <LabelHelp
            className='small-help'
            help='Amount to bond and nominate:'
          />
        </Header>
        <InputBalance
          className='small'
          defaultValue={amountToNominate || new BN(0)}
          isDecimal
          isFull
          isZeroable
          maxValue={maxAmountToNominate || new BN(0)}
          onChange={setAmountToNominate}
          withMax
        />
      </div>
      <div className='warning-block'>
        Warning: After bonding, your funds will be locked and will remain locked after the nomination is stopped for {formatNumber(eraLength)} blocks, which is approximately {text}.
      </div>
    </section>
  );
}

export default React.memo(styled(BondSection)``);
