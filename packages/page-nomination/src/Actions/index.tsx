// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ActiveEraInfo, EraIndex } from '@polkadot/types/interfaces';
import { StakerState } from '@polkadot/react-hooks/types';

import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import { useCall, useApi } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';
import { Option } from '@polkadot/types';
import Spinner from '@polkadot/react-components/Spinner';

import ElectionBanner from '../components/ElectionBanner';
import Account from './Account';
import NewStake from './NewStake';
import './styles.scss';

interface Props {
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

function Actions ({ hideNewStake, isInElection, next, ownStashes, selectedValidators, validators }: Props): React.ReactElement<Props> {
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
  }, [ownStashes]);

  return (
    <div className='manage-nomination-actions'>
      {!hideNewStake &&
      <NewStake/>
      }
      <ElectionBanner isInElection={isInElection} />
      { (!foundStashes || !foundStashes.length) ? (
        <div className='stakes table'>
          <Spinner label={'No funds staked yet. Bond funds to validate or nominate a validator'} />
        </div>
      ) : (
        <div className='stakes table'>
          <div className='thead white-block'>
            <div className='column'>
              Accounts
            </div>
            <div className='column'>
              Active nomination
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
                activeEra={activeEra}
                info={info}
                isDisabled={isInElection}
                key={info.stashId}
                next={next}
                selectedValidators={selectedValidators}
                stashId={info.stashId}
                validators={validators}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(Actions);
