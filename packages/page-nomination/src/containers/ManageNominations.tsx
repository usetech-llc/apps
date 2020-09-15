// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StakerState } from '@polkadot/react-hooks/types';
import { ElectionStatus } from '@polkadot/types/interfaces';
import { DeriveStakingOverview, DeriveStakingElected } from '@polkadot/api-derive/types';
import { QueueAction$Add } from '@polkadot/react-components/Status/types';
import { ValidatorInfo } from '@polkadot/app-nomination/types';

import React from 'react';
import styled from 'styled-components';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import { useApi, useCall } from '@polkadot/react-hooks';

import Actions from '../Actions';


interface Props {
  isKusama: boolean;
  optimalValidators: ValidatorInfo[];
  ownStashes: StakerState[] | undefined;
  queueAction: QueueAction$Add;
  stakingOverview: DeriveStakingOverview | undefined;
}

function ManageNomination ({ optimalValidators, ksi, nominationServerAvailable, ownStashes, queueAction, stakingOverview, setKsi }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  // const electedInfo = useCall<DeriveStakingElected>(api.derive.staking.electedInfo, []);
  // console.log('electedInfo', electedInfo);

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
        ksi={ksi}
        setKsi={setKsi}
        nominationServerAvailable={nominationServerAvailable}
        optimalValidators={optimalValidators}
        ownStashes={ownStashes}
        queueAction={queueAction}
        stakingOverview={stakingOverview}
      />
    </div>
  );
}

export default React.memo(styled(ManageNomination)``);
