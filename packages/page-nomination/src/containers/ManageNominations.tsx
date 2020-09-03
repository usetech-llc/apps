// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { StakerState } from '@polkadot/react-hooks/types';
import { ElectionStatus } from '@polkadot/types/interfaces';

import React from 'react';
import styled from 'styled-components';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import { useApi, useCall } from '@polkadot/react-hooks';

import Actions from '../Actions';

interface Props {
  backToWallet: () => void;
  isKusama: boolean;
  next?: string[];
  ownStashes: StakerState[] | undefined;
  selectedValidators: string[];
  validators?: string[];
}

function ManageNomination ({ next, ownStashes, selectedValidators, validators }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const isInElection = useCall<boolean>(api.query.staking?.eraElectionStatus, [], {
    transform: (status: ElectionStatus) => status.isOpen
  });

  return (
    <div className='manage-nomination'>
      <div className='manage-nomination-row'>
        <div className='left'>
          <Header as={'h1'}>
            Manage Nominations
          </Header>
        </div>
      </div>
      <Actions
        hideNewStake
        isInElection={isInElection}
        next={next}
        ownStashes={ownStashes}
        selectedValidators={selectedValidators}
        validators={validators}
      />
    </div>
  );
}

export default React.memo(styled(ManageNomination)``);
