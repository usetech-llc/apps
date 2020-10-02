// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { Balance } from '@polkadot/types/interfaces/runtime';
import { ValidatorInfo } from '@polkadot/app-nomination/types';
import { ActionStatus, QueueAction$Add } from '@polkadot/react-components/Status/types';
import { StakerState } from '@polkadot/react-hooks/types';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import BN from 'bn.js';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Icon from '@polkadot/react-components/Icon';
import { useToggle } from '@polkadot/react-hooks';
import LabelHelp from '@polkadot/react-components/LabelHelp';

import AccountSection from '../components/AccountSection';
import BondSection from '../components/BondSection';
import { useBalanceClear, useFees, WholeFeesType } from '../hooks/useBalance';
import { useSlashes } from '../hooks/useShalses';
import BondAndNominateModal from '../components/BondAndNominateModal';
import BondExtra from '../Actions/Account/BondExtra';
import BannerExtension from '../components/BannerExtension';

interface Props {
  accountId: string | null;
  accountsAvailable: boolean;
  amountToNominate: BN | undefined | null;
  ksi: number;
  nominationServerAvailable: boolean;
  optimalValidators: ValidatorInfo[];
  ownStashes: StakerState[] | undefined;
  queueAction: QueueAction$Add;
  setAccountId: (accountId: string | null) => void;
  setAmountToNominate: (amountToNominate: BN | undefined) => void;
  setKsi: (ksi: Array<number>) => void;
  stakingOverview: DeriveStakingOverview | undefined;
  validatorsFromServerLoading: boolean;
  web3Enabled: boolean;
}

function NewNomination (props: Props): React.ReactElement<Props> {
  const {
    accountId,
    accountsAvailable,
    amountToNominate,
    ksi,
    nominationServerAvailable,
    ownStashes,
    optimalValidators,
    queueAction,
    setAccountId,
    setAmountToNominate,
    setKsi,
    stakingOverview,
    validatorsFromServerLoading,
    web3Enabled,
  } = props;

  const { wholeFees }: WholeFeesType = useFees(accountId, optimalValidators);
  // const [wholeFees, ] = useState(new BN(0));
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
      <Header as='h1'>
        New nomination
        <LabelHelp
          className='small-help'
          help={'Make a new nomination'}
          description={
            <div>
              Here are the main steps for making the new nomination:
              <p>
                1. We currently support only Polkadot.JS extension wallet and automatically detect your accounts there, all you need to do is allow us to do that. No other authorizations are made with that call.
              </p>
              <p>
                2. If you have several accounts, choose the one that has your funds which you want to nominate. We will show you the available balance on that account and calculate and pre-fill the field for the amount of nomination with a maximum available (some funds need to remain in the account for transaction fees). Be aware – Kusama nomination can be stopped at any time, but after you do that, the network will take around 7 days to unbond your funds, during which you will not earn any income on them.
              </p>
              <p>
                3. Click "Bond and Nominate" and we will take you to the next screen where you can choose the nomination strategy.
              </p>
            </div>
          }
        />
      </Header>
      <div className='nomination-card'>
        <BannerExtension />
        {web3Enabled && (
          <AccountSection
            accountId={accountId}
            accountsAvailable={accountsAvailable}
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
         { (accountId && !maxAmountToNominate) && (
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
              nominationServerAvailable={nominationServerAvailable}
              optimalValidators={optimalValidators}
              queueAction={queueAction}
              setIsNominating={setIsNominating}
              stashIsCurrent={stashIsCurrent}
              stakingOverview={stakingOverview}
              toggleNominationModal={toggleNominationModal}
              validatorsFromServerLoading={validatorsFromServerLoading}
            />
          )}
          {(isBondExtraOpen && accountId) && (
            <BondExtra
              amount={amountToNominate}
              onClose={toggleBondExtra}
              stashId={accountId}
            />
          )}
          { web3Enabled && (
            <>
              <Button
                icon
                disabled={!amountToNominate || !amountToNominate || !amountToNominate.gtn(0) || isNominating || !maxAmountToNominate}
                loading={isNominating}
                onClick={openNominationModal}
                primary
              >
                {stashIsCurrent ? 'Bond more' : 'Bond and Nominate'}
                <Icon
                  icon={'play'}
                />
              </Button>
              <LabelHelp
                className='small-help'
                help={'Start nomination process'}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(NewNomination);
