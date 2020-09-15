// Copyright 2017-2020 UseTech @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveBalancesAll, DeriveStakingAccount } from '@polkadot/api-derive/types';
import { EraIndex, ValidatorPrefsTo145 } from '@polkadot/types/interfaces';
import { StakerState } from '@polkadot/react-hooks/types';
import { QueueAction$Add } from '@polkadot/react-components/Status/types';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { ValidatorInfo } from '@polkadot/app-nomination/types';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import {
  AddressMini,
  StakingBonded,
  StakingUnbonding,
  StatusContext,
  TxButton,
  LabelHelp
} from '@polkadot/react-components';
import { useApi, useCall, useToggle } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';
import StakingRedeemable from '@polkadot/react-components/StakingRedeemable';

import BondExtra from './BondExtra';
// import Nominate from './Nominate';
import Unbond from './Unbond';
import useInactives from '../useInactives';
import arrow from '../../assets/icons/arrow.svg';
import BondAndNominateModal from '../../components/BondAndNominateModal';
import NominatorRow from './NominatorRow';

interface Props {
  className?: string;
  isDisabled?: boolean;
  info: StakerState;
  next?: string[];
  optimalValidators: ValidatorInfo[];
  queueAction: QueueAction$Add;
  stakingOverview: DeriveStakingOverview | undefined;
  validators?: string[];
}

function CommissionBalance (stakingInfo: DeriveStakingAccount, withLabel?: string): any {
  if (!stakingInfo || !stakingInfo.validatorPrefs) {
    return null;
  }

  return (
    <>
      <div />
      {(stakingInfo.validatorPrefs as any as ValidatorPrefsTo145).unstakeThreshold && (
        <>
          <span>{withLabel}</span>
          <div className='result'>
            {(stakingInfo.validatorPrefs as any as ValidatorPrefsTo145).unstakeThreshold.toString()}
          </div>
        </>
      )}
      {(stakingInfo.validatorPrefs.commission || (stakingInfo.validatorPrefs as any as ValidatorPrefsTo145).validatorPayment) && (
        (stakingInfo.validatorPrefs as any as ValidatorPrefsTo145).validatorPayment
          ? (
            <>
              <span>{withLabel}</span>
              <FormatBalance
                className='result'
                value={(stakingInfo.validatorPrefs as any as ValidatorPrefsTo145).validatorPayment}
              />
            </>
          )
          : (
            <>
              <span>{withLabel}</span>
              <span>{(stakingInfo.validatorPrefs.commission.unwrap().toNumber() / 10_000_000).toFixed(2)}%</span>
            </>
          )
      )}
    </>
  );
}

function Account (props: Props): React.ReactElement<Props> {
  const {
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
  } = props;

  const { api } = useApi();
  const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances.all, [stashId]);
  const stakingAccount = useCall<DeriveStakingAccount>(api.derive.staking.account, [stashId]);
  const [isBondExtraOpen, toggleBondExtra] = useToggle();
  const [isAccordionOpen, toggleAccordion] = useToggle();
  const [nominationModalOpened, setNominationModalOpened] = useState<boolean>(false);
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
          { nominationModalOpened && (
            <BondAndNominateModal
              accountId={stashId}
              ksi={ksi}
              setKsi={setKsi}
              nominating={nominating}
              nominationServerAvailable={nominationServerAvailable}
              optimalValidators={optimalValidators}
              setNominationModalOpened={setNominationModalOpened}
              stashIsCurrent
              stakingOverview={stakingOverview}
              queueAction={queueAction}
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
          {/* <TxButton
            accountId={controllerId}
            className='footer-button'
            icon={isStashNominating ? 'exclamation-triangle' : 'check'}
            isDisabled={!selectedValidators || !selectedValidators.length}
            isPrimary
            label={
              isStashNominating ? (
                <>
                  Update nomination
                  <LabelHelp
                    className='small-help'
                    help={'Your nomination is not optimal. Update please!'}
                  />
                </>
              ) : 'Nominate'}
            params={[selectedValidators]}
            tx='staking.nominate'
          /> */}
          <Button
            className='footer-button'
            disabled={!isStashNominating}
            onClick={setNominationModalOpened.bind(null, true)}
          >
            { isStashNominating ? (
            <>
              Update nomination
              <LabelHelp
                className='small-help'
                help={'Your nomination is not optimal. Update please!'}
              />
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
                    <NominatorRow key={nomineeId} validatorId={nomineeId} />
                  ))}
                </>
              )}
              {(nomsInactive && nomsInactive.length > 0) && (
                <>
                  <Header as='h4'>{`${'Inactive nominations'} (${nomsInactive.length})`}</Header>
                  {nomsInactive.map((nomineeId): React.ReactNode => (
                    <NominatorRow key={nomineeId} validatorId={nomineeId} />
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