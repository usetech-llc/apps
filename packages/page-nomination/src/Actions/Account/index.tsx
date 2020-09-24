// Copyright 2017-2020 UseTech @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveBalancesAll, DeriveStakingAccount } from '@polkadot/api-derive/types';
import { StakerState } from '@polkadot/react-hooks/types';
import { QueueAction$Add } from '@polkadot/react-components/Status/types';
import { DeriveStakingOverview, DeriveEraPoints } from '@polkadot/api-derive/types';
import { ValidatorInfo } from '@polkadot/app-nomination/types';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import {
  AddressMini,
  StakingBonded,
  StakingUnbonding,
  StatusContext,
  LabelHelp,
  Icon,
  StakingRedeemable
} from '@polkadot/react-components';
import { useApi, useCall, useToggle } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';

import BondExtra from './BondExtra';
import Unbond from './Unbond';
import useInactives from '../useInactives';
import arrow from '../../assets/icons/arrow.svg';
import BondAndNominateModal from '../../components/BondAndNominateModal';
import NominatorRow from './NominatorRow';

interface Props {
  className?: string;
  erasPoints?: DeriveEraPoints[];
  isDisabled?: boolean;
  info: StakerState;
  ksi: number;
  next?: string[];
  nominationServerAvailable: boolean;
  optimalValidators: ValidatorInfo[];
  queueAction: QueueAction$Add;
  setKsi: (ksi: number) => void;
  stakingOverview: DeriveStakingOverview | undefined;
  validators?: string[];
  validatorsFromServerLoading: boolean;
}

function Account (props: Props): React.ReactElement<Props> {
  const {
    erasPoints,
    info: {
      controllerId,
      isOwnController,
      isOwnStash,
      isStashNominating,
      nominating,
      stakingLedger,
      stashId
    },
    ksi,
    nominationServerAvailable,
    optimalValidators,
    queueAction,
    setKsi,
    stakingOverview,
    validatorsFromServerLoading,
  } = props;

  const { api } = useApi();
  const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances.all, [stashId]);
  const stakingAccount = useCall<DeriveStakingAccount>(api.derive.staking.account, [stashId]);
  const [isBondExtraOpen, toggleBondExtra] = useToggle();
  const [isAccordionOpen, toggleAccordion] = useToggle();
  const [nominationModalOpened, toggleNominationModal] = useToggle();
  const [isUnbondOpen, toggleUnbond] = useToggle();
  const [notOptimal, setNotOptimal] = useState<boolean>(false);
  const { nomsActive, nomsInactive, nomsWaiting } = useInactives(stashId, nominating);
  const { queueExtrinsic } = useContext(StatusContext);

  const stopNomination = useCallback(() => {
    if (!stashId) {
      return;
    }

    const extrinsic = api.tx.staking.chill();
    const isUnsigned = false;

    queueExtrinsic({
      accountId: stashId,
      extrinsic,
      isUnsigned
    });
  }, [api.tx.staking, stashId, queueExtrinsic]);

  const openRewards = useCallback(() => {
    window.open(`https://kusama.subscan.io/account/${stashId}?tab=reward`, '_blank');
  }, [stashId]);

  useEffect((): void => {
    // case if current validators are not optimal
    if (optimalValidators.length && nominating && nominating.length) {
      let count = 0;

      nominating.forEach((validator): void => {
        if (!optimalValidators.find(optimalValidator => optimalValidator.accountId.toString() === validator)) {
          count++;
        }
      });

      // there are 16 nominators, if we have half not optimal, set warning
      if (count >= 8) {
        setNotOptimal && setNotOptimal(true);
      }
    }
  }, [nominating, optimalValidators]);

  return (
    <div className='account-block'>
      <div className='white-block with-footer'>
        <div className='column address'>
          <a
            className='toggle-accordion'
            onClick={toggleAccordion}
          >
            <img src={arrow} className={isAccordionOpen ? 'open' : ''} />
          </a>
          {/* <AddressSmall value={stashId} /> */}
          <AddressMini
            value={stashId}
          />
          {isBondExtraOpen && (
            <BondExtra
              onClose={toggleBondExtra}
              stashId={stashId}
            />
          )}
          {/* 'Your nomination is not optimal. Update please!' */}
          { nominationModalOpened && (
            <BondAndNominateModal
              accountId={stashId}
              ksi={ksi}
              setKsi={setKsi}
              nominating={nominating}
              nominationServerAvailable={nominationServerAvailable}
              optimalValidators={optimalValidators}
              toggleNominationModal={toggleNominationModal}
              stashIsCurrent
              stakingOverview={stakingOverview}
              queueAction={queueAction}
              validatorsFromServerLoading={validatorsFromServerLoading}
            />
          )}
          {isUnbondOpen && (
            <Unbond
              controllerId={controllerId}
              onClose={toggleUnbond}
              stakingLedger={stakingLedger}
              stashId={stashId}
            />
          )}
        </div>
        <div className='column address'>
          {nomsActive && nomsActive.map((nomineeId): React.ReactNode => (
            <AddressMini
              key={nomineeId}
              value={nomineeId}
              withBonded
            />
          ))}
        </div>
        <div className='column date'>
          -
        </div>
        <div className='column all'>
          <StakingBonded
            stakingInfo={stakingAccount}
            withLabel={'Total nominated'}
          />
        </div>
      </div>
      { isAccordionOpen && (
      <div className='accordion-body'>
        <div className='info-row'>
          { balancesAll && (
            <>
              <div className='item'>
                <span>total: </span>
                <FormatBalance
                  className='result'
                  value={balancesAll.votingBalance}
                />
              </div>
              <div className='item'>
                <span>transferable: </span>
                <FormatBalance
                  className='result'
                  value={balancesAll.availableBalance}
                />
              </div>
              <div className='item'>
                <span>locked: </span>
                <FormatBalance
                  className='result'
                  value={balancesAll.lockedBalance}
                />
              </div>
              <div className='item'>
                <StakingRedeemable
                  className='withdraw'
                  stakingInfo={stakingAccount}
                />
              </div>
              <div className='item'>
                <StakingUnbonding
                  className='unbonding'
                  stakingInfo={stakingAccount}
                  withLabel={'unbonding'}
                />
              </div>
            </>
          )}
        </div>
        <div className='footer-row'>
          <Button
            className='footer-button'
            disabled={!isOwnStash && (!balancesAll || balancesAll.freeBalance.gtn(0))}
            onClick={openRewards}
          >
            Rewards
          </Button>
          <Button
            className='footer-button'
            disabled={!isOwnController}
            onClick={toggleBondExtra}
          >
            Bond more
          </Button>
          <Button
            className={`footer-button ${notOptimal ? 'warning' : ''}`}
            disabled={!isStashNominating}
            onClick={toggleNominationModal}
          >
            { isStashNominating ? (
            <>
              Update nomination
              <LabelHelp
                className='small-help'
                help={'Your nomination is not optimal. Update please!'}
              />
              { notOptimal && (
                <Icon icon='wind-warning' />
              )}
            </>
            ) : 'Nominate'}
          </Button>
          <Button
            className='footer-button'
            disabled={!isStashNominating}
            onClick={stopNomination}
          >
            Stop nomination
          </Button>
          <Button
            className='footer-button'
            disabled={!isOwnStash && (!balancesAll || !balancesAll.freeBalance.gtn(0))}
            onClick={toggleUnbond}
          >
            Unbond
          </Button>
        </div>
        <div className='column accordion'>
          <div className='stakes table'>
            <div className='thead'>
              <div className='column'>
                Validators
                <LabelHelp
                  className='small-help'
                  help={'Validators'}
                />
              </div>
              <div className='column'>
                Other stake
                <LabelHelp
                  className='small-help'
                  help={'Other stake'}
                />
              </div>
              <div className='column'>
                Own stake
                <LabelHelp
                  className='small-help'
                  help={'Own stake'}
                />
              </div>
              <div className='column'>
                Commission
                <LabelHelp
                  className='small-help'
                  help={'Commission'}
                />
              </div>
              <div className='column'>
                Points
                <LabelHelp
                  className='small-help'
                  help={'Points'}
                />
              </div>
            </div>
            <div className='tbody'>
              {(nomsWaiting && nomsWaiting.length > 0) && (
                <>
                  <Header as='h4'>{`Waiting nominations (${nomsWaiting.length})`}</Header>
                  {nomsWaiting.map((nomineeId): React.ReactNode => (
                    <NominatorRow erasPoints={erasPoints} key={nomineeId} validatorId={nomineeId} />
                  ))}
                </>
              )}
              {(nomsInactive && nomsInactive.length > 0) && (
                <>
                  <Header as='h4'>{`${'Inactive nominations'} (${nomsInactive.length})`}</Header>
                  {nomsInactive.map((nomineeId): React.ReactNode => (
                    <NominatorRow erasPoints={erasPoints} key={nomineeId} validatorId={nomineeId} />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default React.memo(Account);
