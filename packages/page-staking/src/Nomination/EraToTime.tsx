// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';

import { useApi, useCall } from '@polkadot/react-hooks';
import { useTranslation } from '@polkadot/app-accounts/translate';
import { BareProps } from '@polkadot/react-api/types';
import { DeriveSessionProgress } from '@polkadot/api-derive/types';
import { BlockToTime } from '@polkadot/react-query';
import { formatNumber } from '@polkadot/util';

interface EraToTimeInterface extends BareProps{
  showBlocks?: boolean;
  showDays?: boolean;
}

function EraToTime ({ className, showBlocks, showDays, style }: EraToTimeInterface): React.ReactElement<EraToTimeInterface> | null {
  const { api } = useApi();
  const { t } = useTranslation();
  const progress = useCall<DeriveSessionProgress>(api.derive.session.progress, []);
  const bondedDuration = api.consts.staking.bondingDuration;
  let eraLength = null;

  if (progress && progress.eraLength) {
    eraLength = progress.eraLength.toBn().mul(bondedDuration);
  }

  if (!eraLength) {
    return null;
  }

  return (
    <span
      className={className}
      style={style}
    >
      <BlockToTime
        blocks={showDays ? eraLength : undefined}
        className='text-inline'
        label={`${showBlocks ? t('{{blocks}} blocks', { replace: { blocks: formatNumber(eraLength) } }) : ''}${showBlocks && showDays ? ', ' : ''}`}
      />
    </span>
  );
}

export default React.memo(styled(EraToTime)`
  .text-inline {
    display: inline;
  }
`);
