// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveBalancesAll, DeriveStakingAccount } from '@polkadot/api-derive/types';
import { EraIndex } from '@polkadot/types/interfaces';
import { StakerState } from '@polkadot/react-hooks/types';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Popup as SemanticPopup } from 'semantic-ui-react';
import { AddressInfo,
  AddressSmall,
  Button,
  Menu,
  Popup,
  Icon,
  StakingBonded,
  StakingRedeemable,
  StakingUnbonding,
  StatusContext } from '@polkadot/react-components';
import { useApi, useCall, useToggle } from '@polkadot/react-hooks';

import { useTranslation } from '../../translate';
import BondExtra from './BondExtra';
import ListNominees from './ListNominees';
import Nominate from './Nominate';
import Unbond from './Unbond';

interface Props {
  activeEra?: EraIndex;
  className?: string;
  isDisabled?: boolean;
  info: StakerState;
  next?: string[];
  stashId: string;
  validators?: string[];
  selectedValidators?: string[];
}

function Account ({ className, info: { controllerId, hexSessionIdNext, hexSessionIdQueue, isOwnController, isOwnStash, isStashNominating, isStashValidating, nominating, stakingLedger, stashId }, next, selectedValidators, validators }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances.all, [stashId]);
  const stakingAccount = useCall<DeriveStakingAccount>(api.derive.staking.account, [stashId]);
  const [isBondExtraOpen, toggleBondExtra] = useToggle();
  const [isNominateOpen, toggleNominate] = useToggle();
  const [isUnbondOpen, toggleUnbond] = useToggle();
  const [notOptimal, setNotOptimal] = useState<boolean>(false);
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
    if (selectedValidators && selectedValidators.length && nominating && nominating.length) {
      let count = 0;

      nominating.forEach((validator): void => {
        if (!selectedValidators.includes(validator)) {
          count++;
        }
      });

      // there are 16 nominators, if we have half not optimal, set warning
      if (count >= 8) {
        setNotOptimal(true);
      }
    }
  }, [nominating, selectedValidators]);

  return (
    <>
      <tr className={className}>
        <td className='address'>
          <AddressSmall value={stashId} />
          {isBondExtraOpen && (
            <BondExtra
              onClose={toggleBondExtra}
              stashId={stashId}
            />
          )}
          {isNominateOpen && controllerId && (
            <Nominate
              controllerId={controllerId}
              isOpen={isNominateOpen}
              next={next}
              nominating={nominating}
              onClose={toggleNominate}
              selectedValidators={selectedValidators}
              stashId={stashId}
              validators={validators}
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
        </td>
        <td className='number'>
          <StakingBonded stakingInfo={stakingAccount} />
          <StakingUnbonding stakingInfo={stakingAccount} />
          <StakingRedeemable stakingInfo={stakingAccount} />
          { notOptimal && (
            <SemanticPopup
              content={t('Your nomination is not optimal. Update please!')}
              trigger={
                <Icon name='warning sign' />
              }
            />
          )}
        </td>
        {isStashValidating
          ? (
            <td className='all'>
              <AddressInfo
                address={stashId}
                withBalance
                withBalanceToggle
                withHexSessionId={hexSessionIdNext !== '0x' && [hexSessionIdQueue, hexSessionIdNext]}
                withValidatorPrefs
              />
            </td>
          )
          : (
            <td className='all'>
              <AddressInfo
                address={stashId}
                withBalance
                withBalanceToggle
                withHexSessionId={hexSessionIdNext !== '0x' && [hexSessionIdQueue, hexSessionIdNext]}
                withValidatorPrefs
              />
              {isStashNominating && (
                <ListNominees
                  nominating={nominating}
                  stashId={stashId}
                />
              )}
            </td>
          )
        }
      </tr>
      <tr>
        <td colSpan={3}>
          <Button.Group>
            <Button
              icon=''
              isDisabled={!isOwnStash && !balancesAll?.freeBalance.gtn(0)}
              key='unbond'
              label={t('Rewards')}
              onClick={openRewards}
            />
            <Button
              icon=''
              isDisabled={!isOwnController}
              key='bondMore'
              label={t('Bond more funds')}
              onClick={toggleBondExtra}
            />
            <Button
              icon=''
              isDisabled={!isOwnController}
              key='update'
              label={t('Update nomination')}
              onClick={toggleNominate}
            />
            <Button
              icon=''
              isDisabled={!isStashNominating}
              key='stop'
              label={t('Stop nomination')}
              onClick={stopNomination}
            />
            <Button
              icon=''
              isDisabled={!isOwnStash && !balancesAll?.freeBalance.gtn(0)}
              key='unbond'
              label={t('Unbond funds')}
              onClick={toggleUnbond}
            />
          </Button.Group>
        </td>
      </tr>
    </>
  );
}

export default React.memo(styled(Account)`
  .ui--Button-Group {
    display: inline-block;
    margin-right: 0.25rem;
    vertical-align: inherit;
  }
`);
