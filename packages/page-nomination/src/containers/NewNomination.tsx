// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { Balance } from '@polkadot/types/interfaces/runtime';
import { ActionStatus, QueueAction$Add } from '@polkadot/react-components/Status/types';
import { StakerState } from '@polkadot/react-hooks/types';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import BN from 'bn.js';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import { Icon } from '@polkadot/react-components';

import AccountSection from '../components/AccountSection';
import BondSection from '../components/BondSection';
import { useBalanceClear, useFees, WholeFeesType } from '../hooks/useBalance';
import { useSlashes } from '../hooks/useShalses';
import BondAndNominateModal from '../components/BondAndNominateModal';
import BondExtra from "@polkadot/app-nomination/Actions/Account/BondExtra";
import {useToggle} from "@polkadot/react-hooks/index";


interface Props {
  accountId: string | null;
  accountsAvailable: boolean;
  amountToNominate: BN | undefined | null;
  ownStashes: StakerState[] | undefined;
  queueAction: QueueAction$Add;
  setAccountId: (accountId: string | null) => void;
  setAmountToNominate: (amountToNominate: BN | undefined) => void;
  stakingOverview: DeriveStakingOverview | undefined;
  web3Enabled: boolean;
}

function NewNomination (props: Props): React.ReactElement<Props> {
  const {
    accountId,
    accountsAvailable,
    amountToNominate,
    ksi,
    ownStashes,
    optimalValidators,
    queueAction,
    setAccountId,
    setAmountToNominate,
    setKsi,
    stakingOverview,
    web3Enabled,
  } = props;

  const { wholeFees }: WholeFeesType = useFees(accountId, optimalValidators);
  const accountBalance: Balance | null = useBalanceClear(accountId);
  const [maxAmountToNominate, setMaxAmountToNominate] = useState<BN | undefined | null>(null);
  const [nominationModalOpened, toggleNominationModal] = useToggle();
  const [isBondExtraOpen, toggleBondExtra] = useToggle();
  const [isNominating, setIsNominating] = useState<boolean>(false);
  const [stashIsCurrent, setStashIsCurrent] = useState<boolean>(false);

  const slashes = useSlashes(accountId);
  const currentAccountRef = useRef<string | null>();

  const calculateMaxPreFilledBalance = useCallback((): void => {
    if (maxAmountToNominate) {
      // double wholeFees
      if (!amountToNominate) {
        setAmountToNominate(maxAmountToNominate);
      }
    }
  }, [amountToNominate, maxAmountToNominate]);

  const disableStartButton = useCallback(() => {
    if (!ownStashes) {
      return;
    }
    const currentStash = ownStashes.find((stash) => stash.stashId === accountId);
    setStashIsCurrent(!!currentStash);
  }, [accountId, ownStashes]);

  const openNominationModal = useCallback(() => {
    if (stashIsCurrent) {
      toggleBondExtra();
    } else {
      toggleNominationModal();
    }
  }, [stashIsCurrent, toggleBondExtra, toggleNominationModal]);

  useEffect(() => {
    calculateMaxPreFilledBalance();
  }, [calculateMaxPreFilledBalance]);

  // if balance is null or lower than double whole fees
  useEffect(() => {
    if (accountBalance && wholeFees) {
      const maxAmount = accountBalance.sub(wholeFees).sub(wholeFees);

      if (maxAmount.gt(new BN(0))) {
        setMaxAmountToNominate(maxAmount);
      } else {
        setMaxAmountToNominate(null);
      }
    }
  }, [accountBalance, wholeFees]);

  // show notification when change account
  useEffect(() => {
    if (currentAccountRef.current && currentAccountRef.current !== accountId) {
      const message: ActionStatus = {
        action: '',
        message: 'Account was changed!',
        status: 'success'
      };

      queueAction([message]);
    }

    currentAccountRef.current = accountId;
  }, [accountId, queueAction]);

  useEffect(() => {
    disableStartButton();
  }, [disableStartButton]);

  return (
    <div className='nomination-row'>
      <Header as='h1'>New nomination</Header>
      <div className='nomination-card'>
        {!web3Enabled &&
        <div className='error-block'>Please enable the polkadot.js extension!</div>
        }
        {web3Enabled && (
          <AccountSection
            accountId={accountId}
            accountsAvailable={accountsAvailable}
            amount={accountBalance || new BN(0)}
            setAccountId={setAccountId}
          />
        )}
        { amountToNominate && maxAmountToNominate && (
          <>
            <div className='divider' />
            <BondSection
              amountToNominate={amountToNominate}
              maxAmountToNominate={maxAmountToNominate}
              setAmountToNominate={setAmountToNominate}
            />
          </>
        )}
         { !maxAmountToNominate && (
          <div className='error-block'>You have no enough balance for nomination</div>
        )}
        { slashes > 0 &&
        <div className='error-block'>Warning: You have been slashed. You need to update your nomination.</div>
        }
        <div className='button-block right'>
          { nominationModalOpened && (
            <BondAndNominateModal
              accountId={accountId}
              amountToNominate={amountToNominate}
              ksi={ksi}
              setKsi={setKsi}
              isNominating={isNominating}
              optimalValidators={optimalValidators}
              setIsNominating={setIsNominating}
              setNominationModalOpened={toggleNominationModal}
              stashIsCurrent={stashIsCurrent}
              stakingOverview={stakingOverview}
              queueAction={queueAction}
            />
          )}
          {isBondExtraOpen && (
            <BondExtra
              onClose={toggleBondExtra}
              stashId={accountId}
            />
          )}
          <Button
            icon
            disabled={!amountToNominate || !amountToNominate.gtn(0) || isNominating}
            loading={isNominating}
            onClick={openNominationModal}
            primary
          >
            {stashIsCurrent ? 'Bond more' : 'Bond and Nominate'}
            <Icon
              icon={'play'}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(NewNomination);
