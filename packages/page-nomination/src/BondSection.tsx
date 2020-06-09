// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';
import BN from 'bn.js';

import { useTranslation } from './translate';
import EraToTime from './EraToTime';
import InputBalance from './InputBalance';

interface Props {
  amount: BN | undefined;
  balanceInitialized: boolean;
  setAmountToNominate: (amount: BN | undefined) => void;
}

function BondSection ({ amount, balanceInitialized, setAmountToNominate }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  return (
    <section className='bond-section'>
      <div className='bond-section-block'>
        <h2>{t('Amount to bond and nominate:')}</h2>
        { balanceInitialized && (
          <InputBalance
            defaultValue={amount}
            isDecimal
            isFull
            isZeroable
            maxValue={amount}
            onChange={setAmountToNominate}
            withMax
          />
        )}
      </div>
      <div className='warning-block'>
        {t('Warning: After bonding, your funds will be locked and will remain locked after the nomination is stopped for')}
        <EraToTime showBlocks/>, {t('which is approximately')} <EraToTime showDays/>.
      </div>
    </section>
  );
}

export default React.memo(styled(BondSection)``);
