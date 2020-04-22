// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import BN from 'bn.js';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';
import { DeriveBalancesAll, DeriveStakingAccount, DeriveStakingOverview, DeriveStakerReward } from '@polkadot/api-derive/types';
import { EraIndex, ValidatorPrefs } from '@polkadot/types/interfaces';
import { Codec, ITuple } from '@polkadot/types/types';
import { AddressInfo, AddressMini, AddressSmall, Button, Expander, Menu, Popup, StakingBonded, StakingRedeemable, StakingUnbonding, StatusContext, TxButton } from '@polkadot/react-components';
import { useAccounts, useApi, useCall, useToggle } from '@polkadot/react-hooks';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { FormatBalance } from '@polkadot/react-query';
import { ApiPromise } from '@polkadot/api';
import { useTranslation } from '../translate';
import BondExtra from '../Actions/Account/BondExtra';
import InjectKeys from '../Actions/Account/InjectKeys';
import Nominate from '../Actions/Account/Nominate';
import SetControllerAccount from '../Actions/Account/SetControllerAccount';
import SetRewardDestination from '../Actions/Account/SetRewardDestination';
import SetSessionKey from '../Actions/Account/SetSessionKey';
import Unbond from '../Actions/Account/Unbond';
import Validate from '../Actions/Account/Validate';
import { getStakeState, StakeState } from '../Actions/Account';
import useInactives from './useInactives';

type ValidatorInfo = ITuple<[ValidatorPrefs, Codec]> | ValidatorPrefs;

interface Props {
  activeEra?: EraIndex;
  allStashes?: string[];
  className?: string;
  isOwnStash: boolean;
  isVisible: boolean;
  next?: string[];
  onUpdateType: (stashId: string, type: 'validator' | 'nominator' | 'started' | 'other') => void;
  onUpdateControllerState: (controllerAlreadyBonded: boolean) => void;
  onUpdateNominatedState: (controllerAlreadyBonded: boolean) => void;
  rewards?: DeriveStakerReward[];
  stakingOverview?: DeriveStakingOverview;
  stashId: string;
  selectedControllerId?: string | null,
  isDisabled?: boolean;
  validators?: string[];
}

function NominatedAccount ({ allStashes, className, isOwnStash, next, onUpdateType, isDisabled, validators, stashId, selectedControllerId, onUpdateControllerState, onUpdateNominatedState }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const { allAccounts } = useAccounts();
  const validateInfo = useCall<ValidatorInfo>(api.query.staking.validators, [stashId]);
  const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances.all, [stashId]);
  const stakingAccount = useCall<DeriveStakingAccount>(api.derive.staking.account, [stashId]);
  const [{ controllerId, destination, destinationId, hexSessionIdNext, hexSessionIdQueue, isLoading, isOwnController, isStashNominating, isStashValidating, nominating, sessionIds, stakingLedger }, setStakeState] = useState<StakeState>({ controllerId: null, destinationId: 0, hexSessionIdNext: null, hexSessionIdQueue: null, isLoading: true, isOwnController: false, isStashNominating: false, isStashValidating: false, sessionIds: [] });
  const [activeNoms, setActiveNoms] = useState<string[]>([]);
  const [maxUnBond, setMaxUnbond] = useState(new BN(0));
  const inactiveNoms = useInactives(stashId, nominating);
  const [isBondExtraOpen, toggleBondExtra] = useToggle();
  const [isInjectOpen, toggleInject] = useToggle();
  const [isNominateOpen, toggleNominate] = useToggle();
  const [isRewardDestinationOpen, toggleRewardDestination] = useToggle();
  const [isSetControllerOpen, toggleSetController] = useToggle();
  const [isSetSessionOpen, toggleSetSession] = useToggle();
  const [isSettingsOpen, toggleSettings] = useToggle();
  const [isUnbondOpen, toggleUnbond] = useToggle();
  const [isValidateOpen, toggleValidate] = useToggle();

  useEffect((): void => {
    if (stakingAccount && validateInfo) {
      const state = getStakeState(allAccounts, allStashes, stakingAccount, stashId, validateInfo);

      setStakeState(state);
      onUpdateType(
        stashId,
        state.isStashValidating
          ? 'validator'
          : state.isStashNominating
          ? 'nominator'
          : 'other'
      );
    }
  }, [allAccounts, allStashes, onUpdateType, stakingAccount, stashId, validateInfo]);

  useEffect((): void => {
    // if controller already used
    if (controllerId === selectedControllerId) {
      onUpdateControllerState(true);
      if (isStashNominating) {
        onUpdateNominatedState(true);
      }
    }
  }, [controllerId, onUpdateControllerState, selectedControllerId, isStashNominating]);

  useEffect((): void => {
    nominating && setActiveNoms(
      nominating.filter((id): boolean => !inactiveNoms.includes(id))
    );
  }, [inactiveNoms, nominating]);

  useEffect(() => {
    setMaxUnbond(stakingAccount?.stakingLedger?.active.unwrap());
  }, [stakingAccount]);

  const selectedValidators = [];

  return (
    <tr className={className}>
      <td className='address'>
        <AddressSmall value={stashId} />
        {isBondExtraOpen && (
          <BondExtra
            onClose={toggleBondExtra}
            stashId={stashId}
          />
        )}
        {isInjectOpen && (
          <InjectKeys onClose={toggleInject} />
        )}
        {isNominateOpen && controllerId && (
          <Nominate
            controllerId={controllerId}
            isOpen={isNominateOpen}
            next={next}
            nominating={nominating}
            onClose={toggleNominate}
            stashId={stashId}
            validators={validators}
          />
        )}
        {isSetControllerOpen && controllerId && (
          <SetControllerAccount
            defaultControllerId={controllerId}
            onClose={toggleSetController}
            stashId={stashId}
          />
        )}
        {isRewardDestinationOpen && controllerId && (
          <SetRewardDestination
            controllerId={controllerId}
            defaultDestination={destinationId}
            onClose={toggleRewardDestination}
          />
        )}
        {isSetSessionOpen && controllerId && (
          <SetSessionKey
            controllerId={controllerId}
            onClose={toggleSetSession}
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
        {isValidateOpen && controllerId && (
          <Validate
            controllerId={controllerId}
            onClose={toggleValidate}
            stashId={stashId}
          />
        )}
      </td>
      <td className='address'>
        <AddressMini value={controllerId} />
      </td>
      <td className='number'>{destination}</td>
      <td className='number'>
        <StakingBonded stakingInfo={stakingAccount} />
        <StakingUnbonding stakingInfo={stakingAccount} />
        <StakingRedeemable stakingInfo={stakingAccount} />
      </td>
      {isStashValidating
        ? (
          <td className='all'>
            <AddressInfo
              address={stashId}
              withBalance={false}
              withHexSessionId={hexSessionIdNext !== '0x' && [hexSessionIdQueue, hexSessionIdNext]}
              withValidatorPrefs
            />
          </td>
        )
        : (
          <td className='all'>
            {isStashNominating && (
              <>
                {activeNoms.length !== 0 && (
                  <Expander summary={t('Active nominations ({{count}})', { replace: { count: activeNoms.length } })}>
                    {activeNoms.map((nomineeId, index): React.ReactNode => (
                      <AddressMini
                        key={index}
                        value={nomineeId}
                        withBalance={false}
                        withBonded
                      />
                    ))}
                  </Expander>
                )}
                {inactiveNoms.length !== 0 && (
                  <Expander summary={t('Inactive nominations ({{count}})', { replace: { count: inactiveNoms.length } })}>
                    {inactiveNoms.map((nomineeId, index): React.ReactNode => (
                      <AddressMini
                        key={index}
                        value={nomineeId}
                        withBalance={false}
                        withBonded
                      />
                    ))}
                  </Expander>
                )}
              </>
            )}
          </td>
        )
      }
      <td className='button'>
        {isLoading
          ? null
          : (
            <>
              {(isStashNominating || isStashValidating) && (
                <>
                  <TxButton
                    accountId={controllerId}
                    isDisabled={!isOwnController}
                    isPrimary={false}
                    label={'Stop'}
                    icon='stop'
                    key='stop'
                    tx='staking.chill'
                  />
                  <TxButton
                    accountId={controllerId}
                    isDisabled={!isOwnController}
                    isPrimary
                    params={[selectedValidators]}
                    label={t('Renew nominations')}
                    icon='recycle'
                    tx='staking.nominate'
                  />
                </>
              )}
              <TxButton
                isDisabled={!isOwnController || isStashNominating}
                accountId={controllerId}
                isPrimary
                label={t('Unbond')}
                icon='sign-out'
                params={[maxUnBond]}
                tx='staking.unbond'
                withSpinner={false}
              />
              <Popup
                isOpen={isSettingsOpen}
                key='settings'
                onClose={toggleSettings}
                trigger={
                  <Button
                    icon='setting'
                    isDisabled={isDisabled}
                    onClick={toggleSettings}
                  />
                }
              >
                <Menu
                  onClick={toggleSettings}
                  text
                  vertical
                >
                  <Menu.Item
                    disabled={!isOwnStash && !balancesAll?.freeBalance.gtn(0)}
                    onClick={toggleBondExtra}
                  >
                    {t('Bond more funds')}
                  </Menu.Item>
                  <Menu.Item
                    disabled={!isOwnController}
                    onClick={toggleUnbond}
                  >
                    {t('Unbond funds')}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    disabled={!isOwnStash}
                    onClick={toggleSetController}
                  >
                    {t('Change controller account')}
                  </Menu.Item>
                  <Menu.Item
                    disabled={!isOwnController}
                    onClick={toggleRewardDestination}
                  >
                    {t('Change reward destination')}
                  </Menu.Item>
                  {isStashValidating &&
                  <Menu.Item
                      disabled={!isOwnController}
                      onClick={toggleValidate}
                  >
                    {t('Change validator preferences')}
                  </Menu.Item>
                  }
                  <Menu.Divider />
                  {!isStashNominating &&
                  <Menu.Item
                      disabled={!isOwnController}
                      onClick={toggleSetSession}
                  >
                    {t('Change session keys')}
                  </Menu.Item>
                  }
                  {isStashNominating &&
                  <Menu.Item
                      disabled={!isOwnController}
                      onClick={toggleNominate}
                  >
                    {t('Set nominees')}
                  </Menu.Item>
                  }
                  {!isStashNominating &&
                  <Menu.Item onClick={toggleInject}>
                    {t('Inject session keys (advanced)')}
                  </Menu.Item>
                  }
                </Menu>
              </Popup>
            </>
          )
        }
      </td>
    </tr>
  );
}

export default React.memo(styled(NominatedAccount)`
  .ui--Button-Group {
    display: inline-block;
    margin-right: 0.25rem;
    vertical-align: inherit;
  }
`);
