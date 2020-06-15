// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ActiveEraInfo, EraIndex } from '@polkadot/types/interfaces';
import { StakerState } from '@polkadot/react-hooks/types';

import BN from 'bn.js';
import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import { useCall, useApi } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';
import { Option } from '@polkadot/types';
import Spinner from '@polkadot/react-components/Spinner';

import ElectionBanner from '../ElectionBanner';
import { useTranslation } from '../translate';
import Account from './Account';
import NewStake from './NewStake';

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
  }, [ownStashes]);

  return (
    <div className={className}>
      {!hideNewStake &&
      <NewStake/>
      }
      <ElectionBanner isInElection={isInElection} />
      { (!foundStashes || !foundStashes.length) ? (
        <div className='stakes table'>
          <Spinner label={t<string>('No funds staked yet. Bond funds to validate or nominate a validator')} />
        </div>
      ) : (
        <div className='stakes table'>
          <div className='thead white-block'>
            <div className='column'>
              {t('Accounts')}
            </div>
            <div className='column'>
              {t('Active nomination')}
            </div>
            <div className='column'>
              {bondedTotal && (
                <>
                  {t('Total bonded:')}
                  <FormatBalance value={bondedTotal} />
                </>
              )}
            </div>
          </div>
          <div className='tbody'>
            {foundStashes?.map((info): React.ReactNode => (
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

export default React.memo(styled(Actions)` 

  * {
    font-family: 'Roboto', sans-serif;
  }
  
  .ui--AccountName {
  
  }
  
  .account-block {
    margin-bottom: 10px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .white-block {
    background: #FFFFFF;
    border: 1px solid #DDDDDD;
    box-sizing: border-box;
    border-radius: 4px;
    margin: 10px 0;
    padding: 9px 16px;
    
    &.with-footer {
        margin-top: 0;
    }
  }
  
  .white-block.with-footer {
    margin-bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: none;
    display: grid;
    grid-template-columns: 170px 170px 1fr;
    column-gap: 10px;
  }
  
  .stakes.table {
    margin-top: 20px;
  }
  
  .footer-row {
    background: #F1F1F1;
    border-radius: 0px 0px 3px 3px;
    padding: 8px 15px;
    border-left: 1px solid #DDDDDD;
    border-right: 1px solid #DDDDDD;
    border-bottom: 1px solid #DDDDDD;
    display: flex;
  }
  
  .table {
    .thead {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: bold;
      font-size: 14px;
      line-height: 22px;
      display: grid;
      grid-template-columns: 170px 1fr 200px;
      column-gap: 10px; 
      text-align: left;
      align-items: center;
    }
    .tbody {
       height: 500px;
       overflow-y: scroll;
       overflow-x: hidden;
    }
  }
  
  .accordion {
    display: grid;
    position: relative;
    
    .with-bottom-border {
      border-bottom: 1px solid #0000002e;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .item {
      margin: 0 10px;
    }
    
    .toggle-accordion {
      color: #464E5F;
      font-size: 18px;
      line-height: 30px;
      text-align: right;
    }
  }
  
  .accordion-header {
    display: grid;
    grid-template-columns: 1fr 37px;
  }
  
  .accordion-body-inner {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .accordion-body {
    display: flex;
    min-height: 30px;
  }
  
  .column.accordion {
    background: #FFFFFF;
    padding: 9px 16px;
    border-left: 1px solid #DDDDDD;
    border-right: 1px solid #DDDDDD;
    
    font-family: 'Roboto';
    
    h4 {
      font-size: 18px;
      line-height: 21px;
      font-family: 'Roboto';
      font-style: normal;
      font-weight: normal;
    }
    
    .ui--AddressMini {
      &.padded {
        padding: 8px 0;
      }
    }
  }
`);
