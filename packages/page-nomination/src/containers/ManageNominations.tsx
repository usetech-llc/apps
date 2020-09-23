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
import LabelHelp from "@polkadot/react-components/LabelHelp";


interface Props {
  electedInfo: DeriveStakingElected;
  isKusama: boolean;
  ksi: number;
  nominationServerAvailable: boolean;
  optimalValidators: ValidatorInfo[];
  ownStashes: StakerState[] | undefined;
  queueAction: QueueAction$Add;
  setKsi: (ksi: number) => void;
  stakingOverview: DeriveStakingOverview | undefined;
  validatorsFromServerLoading: boolean;
}

function ManageNomination (props : Props): React.ReactElement<Props> {
  const {
    optimalValidators,
    ksi,
    nominationServerAvailable,
    ownStashes,
    queueAction,
    stakingOverview,
    setKsi,
    validatorsFromServerLoading,
  } = props;
  const { api } = useApi();
  // const electedInfo = useCall<DeriveStakingElected>(api.derive.staking.electedInfo, []);
  // console.log('electedInfo', electedInfo);

  const isInElection = useCall<boolean>(api.query.staking ? api.query.staking.eraElectionStatus : null, [], {
    transform: (status: ElectionStatus) => status.isOpen
  });

  return (
    <div className='manage-nomination'>
      <div className='manage-nomination-row'>
        <div className='left'>
          <Header as={'h1'}>
            Manage Nominations
            <LabelHelp
              className='small-help'
              help={'Manage existing nominations'}
            />
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
        validatorsFromServerLoading={validatorsFromServerLoading}
      />
    </div>
  );
}

export default React.memo(styled(ManageNomination)``);
