// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ActiveEraInfo, EraIndex } from '@polkadot/types/interfaces';
import { StakerState } from '@polkadot/react-hooks/types';

import BN from 'bn.js';
import styled from 'styled-components';
import React, { useEffect, useMemo, useState } from 'react';
import { Table } from '@polkadot/react-components';
import { useCall, useApi } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';
import { Option } from '@polkadot/types';
import uiSettings from '@polkadot/ui-settings';

import ElectionBanner from '../ElectionBanner';
import { useTranslation } from '../translate';
import Account from './Account';
import NewStake from './NewStake';
import telegram from '../assets/img/telegram.png';

interface Props {
  className?: string;
  hideNewStake?: boolean;
  isInElection?: boolean;
  next?: string[];
  ownStashes?: StakerState[];
  selectedValidators?: string[];
  validators?: string[];
}

interface State {
  bondedTotal?: BN;
  foundStashes?: StakerState[];
}

function Actions ({ className, hideNewStake, isInElection, next, ownStashes, selectedValidators, validators }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const activeEra = useCall<EraIndex | undefined>(api.query.staking?.activeEra, [], {
    transform: (activeEra: Option<ActiveEraInfo>) => activeEra.unwrapOr({ index: undefined }).index
  });
  const [{ bondedTotal, foundStashes }, setState] = useState<State>({});

  useEffect((): void => {
    ownStashes && setState({
      bondedTotal: ownStashes.reduce((total: BN, { stakingLedger }) =>
        stakingLedger
          ? total.add(stakingLedger.total.unwrap())
          : total,
      new BN(0)),
      foundStashes: ownStashes.sort((a, b) =>
        (a.isStashValidating ? 1 : (a.isStashNominating ? 5 : 99)) - (b.isStashValidating ? 1 : (b.isStashNominating ? 5 : 99))
      )
    });
    console.log('settings', uiSettings.get());
  }, [ownStashes]);

  const header = useMemo(() => [
    [t('Accounts'), 'start'],
    [t('nominated'), 'number'],
    [undefined, undefined, 2]
  ], [t]);

  const footer = useMemo(() => (
    <tr>
      <td colSpan={2} />
      <td className='number'>
        {bondedTotal && <FormatBalance value={bondedTotal} />}
      </td>
      <td colSpan={2} />
    </tr>
  ), [bondedTotal]);

  const isKusama = uiSettings && uiSettings.apiUrl.includes('kusama');

  return (
    <div className={className}>
      <a
        className='telegram-icon'
        href={isKusama ? 'https://t.me/Kusama_bot ' : 'https://t.me/Polkadot_Ryabina_bot'}
        rel='noreferrer noopener'
        target='_blank'
      >
        Notifications
        <img
          alt='telegram-img'
          className='telegram-img'
          src={telegram}
        />
      </a>
      {!hideNewStake &&
      <NewStake/>
      }
      <ElectionBanner isInElection={isInElection} />
      <Table
        empty={foundStashes && t('No funds staked yet. Bond funds to validate or nominate a validator')}
        footer={footer}
        header={header}
      >
        {foundStashes?.map((info): React.ReactNode => (
          <Account
            activeEra={activeEra}
            info={info}
            isDisabled={isInElection}
            key={info.stashId}
            next={next}
            selectedValidators={selectedValidators}
            validators={validators}
          />
        ))}
      </Table>
    </div>
  );
}

export default React.memo(styled(Actions)`
  .telegram-icon {
    position: absolute;
    right: 10px;
    display: flex;
    align-items: center;
  }
`);
