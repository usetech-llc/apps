// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { StakerState } from '@polkadot/react-hooks/types';

import React, { Suspense } from 'react';
import styled from 'styled-components';
import { ElectionStatus } from '@polkadot/types/interfaces';

import CloseBlock from './CloseBlock';
import { Button, Spinner } from '@polkadot/react-components';
import { useTranslation } from './translate';
import { useApi, useCall } from '@polkadot/react-hooks';

const Actions = React.lazy(() => import('./Actions'));

interface Props {
  backToWallet: () => void;
  isKusama: boolean;
  next?: string[];
  ownStashes: StakerState[] | undefined;
  selectedValidators: string[];
  validators?: string[];
}

function ManageNomination ({ backToWallet, isKusama, next, ownStashes, selectedValidators, validators }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const isInElection = useCall<boolean>(api.query.staking?.eraElectionStatus, [], {
    transform: (status: ElectionStatus) => status.isOpen
  });

  return (
    <div className='nomination-active'>
      <div className='manage-nomination-row'>
        <div className='left'>
          <h1>{t('Manage Nominations')}</h1>
        </div>
        <div className='right'>
          <CloseBlock
            isKusama={isKusama}
            showTelegram
          />
        </div>
      </div>
      <Suspense fallback={<Spinner />}>
        <Actions
          hideNewStake
          isInElection={isInElection}
          next={next}
          ownStashes={ownStashes}
          selectedValidators={selectedValidators}
          validators={validators}
        />
      </Suspense>
      <Button
        className='back'
        label={t('New Nomination')}
        onClick={backToWallet}
      />
    </div>
  );
}

export default React.memo(styled(ManageNomination)``);
