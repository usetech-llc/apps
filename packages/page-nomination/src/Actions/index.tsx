// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EraIndex } from '@polkadot/types/interfaces';
import { StakerState } from '@polkadot/react-hooks/types';
import { QueueAction$Add } from '@polkadot/react-components/Status/types';
import { DeriveStakingOverview, DeriveEraPoints } from '@polkadot/api-derive/types';
import { ValidatorInfo } from '@polkadot/app-nomination/types';

import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import { useCall, useApi } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';
import Spinner from '@polkadot/react-components/Spinner';
import LabelHelp from '@polkadot/react-components/LabelHelp';

import ElectionBanner from '../components/ElectionBanner';
import Account from './Account';
import NewStake from './NewStake';
import './styles.scss';

interface Props {
  hideNewStake?: boolean;
  isInElection?: boolean;
  ksi: number;
  nominationServerAvailable: boolean;
  optimalValidators: ValidatorInfo[];
  ownStashes?: StakerState[];
  queueAction: QueueAction$Add;
  setAccountId: (accountId: string | null) => void;
  setKsi: (ksi: Array<number>) => void;
  stakingOverview: DeriveStakingOverview | undefined;
  validatorsFromServerLoading: boolean;
}

interface State {
  bondedTotal?: BN;
  foundStashes?: StakerState[];
}

function Actions (props: Props): React.ReactElement<Props> {
  const {
    hideNewStake,
    isInElection,
    ksi,
    nominationServerAvailable,
    optimalValidators,
    ownStashes,
    queueAction,
    setAccountId,
    setKsi,
    stakingOverview,
    validatorsFromServerLoading,
  } = props;

  const { api } = useApi();
  const [filteredEras, setFilteredEras] = useState<EraIndex[] | null>(null);
  /* const activeEra = useCall<EraIndex | undefined>(api.query.staking?.activeEra, [], {
    transform: (activeEra: Option<ActiveEraInfo>) => activeEra.unwrapOr({ index: undefined }).index
  }); */
  const allEras = useCall<EraIndex[]>(api.derive.staking.erasHistoric);
  const erasPoints = useCall<DeriveEraPoints[]>(!!filteredEras && api.derive.staking._erasPoints, [filteredEras, false]);
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
  }, [ownStashes]);

  useEffect(() => {
    if (allEras && allEras.length) {
      const filteredEras = allEras.slice(-1);
      setFilteredEras(filteredEras);
    }
  }, [allEras]);

  return (
    <div className='manage-nomination-actions'>
      {!hideNewStake &&
      <NewStake/>
      }
      <ElectionBanner isInElection={isInElection} />
      { (!foundStashes || !foundStashes.length) ? (
        <div className='table'>
          <Spinner label={'No funds staked yet. Bond funds to validate or nominate a validator'} />
        </div>
      ) : (
        <div className='table'>
          <div className='thead white-block'>
            <div className='column'>
              Accounts
            </div>
            <div className='column'>
              Active nomination
              <LabelHelp
                className='small-help'
                description={'Active nominations description Active nominations description Active nominations description Active nominations description Active nominations description '}
                help={'Active nomination'}
              />
            </div>
            <div className='column'>
              Nomination Date
            </div>
            <div className='column'>
              {bondedTotal && (
                <>
                  <FormatBalance value={bondedTotal} />
                  <span className='small'>Total nominated</span>
                </>
              )}
            </div>
          </div>
          <div className='tbody'>
            {foundStashes && foundStashes.map((info: any): React.ReactNode => (
              <Account
                erasPoints={erasPoints}
                info={info}
                isDisabled={isInElection}
                ksi={ksi}
                setAccountId={setAccountId}
                setKsi={setKsi}
                key={info.stashId}
                nominationServerAvailable={nominationServerAvailable}
                optimalValidators={optimalValidators}
                queueAction={queueAction}
                stakingOverview={stakingOverview}
                validatorsFromServerLoading={validatorsFromServerLoading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(Actions);
