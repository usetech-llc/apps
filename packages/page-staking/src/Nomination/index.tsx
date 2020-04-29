// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React, { useState, useEffect, useCallback } from 'react';

import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { SortedTargets } from '@polkadot/app-staking/types';
import { StakerState } from '@polkadot/react-hooks/types';
import { Balance } from '@polkadot/types/interfaces/runtime';
import styled from 'styled-components';
import CreateModal from '@polkadot/app-accounts/Accounts/modals/Create';
import { useApi, useToggle } from '@polkadot/react-hooks';
import { useTranslation } from '@polkadot/app-accounts/translate';
import { Available } from '@polkadot/react-query';
import { AddressInfo, Button, InputBalance, TxButton, Spinner } from '@polkadot/react-components';
import TabsHeader from '@polkadot/app-staking/Nomination/TabsHeader';
import { useBalanceClear, useFees, WholeFeesType } from '@polkadot/app-staking/Nomination/useBalance';
import Summary from '@polkadot/app-staking/Nomination/Summary';
import { formatBalance } from '@polkadot/util';
import Actions from '@polkadot/app-staking/Actions';

import EraToTime from './EraToTime';
import useValidators from './useValidators';
import AccountSelector from './AccountSelector';
import ControllerAccountSelector from './ControllerAccountSelector';

const steps = ['Choose', 'Create', 'Bond', 'Nominate'];
const stepInitialState = ['', 'disabled', 'disabled', 'disabled'];

interface Props {
  className?: string;
  isInElection?: boolean;
  isVisible: boolean;
  next?: string[];
  ownStashes?: StakerState[];
  stakingOverview?: DeriveStakingOverview;
  targets: SortedTargets;
  validators?: string[];
}

function Nomination ({ className, isInElection, isVisible, next, ownStashes, stakingOverview, targets, validators }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [currentStep, setCurrentStep] = useState<string>(steps[0]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isNominated, setIsNominated] = useState<boolean>(false);
  const [controllerAccountId, setControllerAccountId] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [stepsState, setStepsState] = useState<string[]>(stepInitialState);
  const [controllerAlreadyBonded, setControllerAlreadyBonded] = useState<boolean>(false);
  const [isCreateOpen, toggleCreate] = useToggle();
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const { feesLoading, wholeFees }: WholeFeesType = useFees(controllerAccountId, senderId, selectedValidators);
  const [transferableAmount, setTransferableAmount] = useState<BN>(new BN(1));
  const [amountToBond, setAmountToBond] = useState<BN | undefined>();
  const [amount, setAmount] = useState<BN | undefined | null>(null);
  const controllerBalance: Balance | null = useBalanceClear(controllerAccountId);
  const senderBalance: Balance | null = useBalanceClear(senderId);
  const { filteredValidators, validatorsLoading } = useValidators();
  const { t } = useTranslation();
  const destination = 2; // 2 means controller account
  const extrinsic = (amount && controllerAccountId)
    ? api.tx.staking.bond(controllerAccountId, amount, destination)
    : null;
  const existentialDeposit = api.consts.balances.existentialDeposit;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onStatusChange = useCallback(() => {
  }, []);

  function balanceWrapper (text: string): React.ReactNode {
    return (
      <strong className='label'>{text}</strong>
    );
  }

  const goBack = useCallback((): void => {
    const ind = steps.indexOf(currentStep);

    setCurrentStep(steps[ind - 1]);
  }, [currentStep]);

  const goNext = useCallback((): void => {
    const ind = steps.indexOf(currentStep);

    if (ind < 3) {
      setCurrentStep(steps[ind + 1]);
    }
  }, [currentStep]);

  const disableNext = useCallback((): boolean => {
    const ind = steps.indexOf(currentStep);

    return stepsState[ind + 1] === 'disabled';
  }, [currentStep, stepsState]);

  const resetControllerInfo = useCallback((accountId: string | null): void => {
    if (controllerAccountId !== accountId) {
      setControllerAccountId(accountId);
    }
  }, [controllerAccountId]);

  /**
   * double fees for case if fees will be changed on a small count of funds
   * @todo - compare with account balance and throw error if more
   */
  const setAmountToTransfer = useCallback((): void => {
    const minAmount = new BN(0);

    setTransferableAmount(
      minAmount
        .iadd(wholeFees)
        .iadd(wholeFees)
        .isub(controllerBalance || new BN(0))
    );
  }, [controllerBalance, wholeFees]);

  const calculateMaxPreFilledBalance = useCallback((): void => {
    if (senderBalance && wholeFees && !amountToBond) {
      // double wholeFees
      setAmountToBond(senderBalance.toBn().isub(wholeFees).isub(wholeFees).isub(existentialDeposit));
    }
  }, [senderBalance, amountToBond, existentialDeposit, wholeFees]);

  const isBalanceEnough = useCallback((): boolean | null => {
    return (senderBalance &&
      controllerBalance &&
      existentialDeposit &&
      wholeFees &&
      senderBalance.toBn().cmp(existentialDeposit) === 1 &&
      controllerBalance.toBn().cmp(wholeFees) === 1);
  }, [senderBalance, controllerBalance, existentialDeposit, wholeFees]);

  /**
   * Set validators list.
   * If filtered validators
   */
  useEffect(() => {
    if (filteredValidators && filteredValidators.length) {
      setSelectedValidators(
        filteredValidators.map((validator): string => validator.key).slice(0, 16)
      );
    } else {
      stakingOverview && setSelectedValidators(
        stakingOverview.validators.map((acc): string => acc.toString()).slice(0, 16)
      );
    }
  }, [filteredValidators, stakingOverview]);

  /**
   * set amount we can transfer (for paying fees)
   * and calculate max balance we can bonded
   */
  useEffect(() => {
    if (!wholeFees) {
      return;
    }

    setAmountToTransfer();
    calculateMaxPreFilledBalance();
  }, [calculateMaxPreFilledBalance, setAmountToTransfer, wholeFees]);

  /**
   * if we already have stashes
   * we can mark controller as bonded
   * and state as nominated
   */
  useEffect(() => {
    if (ownStashes) {
      const currentStash: StakerState | undefined = ownStashes.find((stash) => stash.controllerId === controllerAccountId);

      if (currentStash) {
        setControllerAlreadyBonded(true);

        if (currentStash.isStashNominating) {
          setIsNominated(true);
        } else {
          setIsNominated(false);
        }
      } else {
        setControllerAlreadyBonded(false);
        setIsNominated(false);
      }
    }
  }, [controllerAccountId, ownStashes, stepsState, senderId]);

  /**
   * if controllerAlreadyBonded
   * or isNominated
   * mark states as completed
   */
  useEffect(() => {
    if (controllerAlreadyBonded && !isNominated) {
      setStepsState((prevState): string[] => {
        const newState = [...prevState];

        newState[2] = 'completed';
        newState[3] = '';

        return newState;
      });

      // go to last tab
      if (currentStep === steps[2]) {
        setCurrentStep(steps[3]);
      }
    }

    if (isNominated) {
      setStepsState((prevState): string[] => {
        const newState = [...prevState];

        newState[2] = 'completed';
        newState[3] = 'completed';

        return newState;
      });

      // go to last tab
      if (currentStep === steps[2]) {
        setCurrentStep(steps[3]);
      }
    }
  }, [senderBalance, controllerBalance, controllerAccountId, controllerAlreadyBonded, currentStep, existentialDeposit, isNominated, senderId]);

  return (
    <main className={`${className} ${!isVisible ? 'staking--hidden' : ''} simple-nominatio`}>
      { validatorsLoading && (
        <Spinner />
      )}
      {!validatorsLoading && (
        <>
          <TabsHeader
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            steps={steps}
            stepsState={stepsState}
          />
          <div className='ui attached segment'>
            {currentStep === steps[0] &&
            <>
              <br />
              <h3>{t('Select your account that holds funds')}:</h3>
              <br />
              <Available
                label={balanceWrapper(t('Your account balance'))}
                params={senderId}
              />
              <AccountSelector
                onChange={setSenderId}
                setControllerAccountId={setControllerAccountId}
                setStepsState={setStepsState}
                stepsState={stepsState}
                title={'Your account'}
                value={senderId}
              />
            </>
            }
            {currentStep === steps[1] &&
            <>
              <br />
              <h3>{t('Now you need to select or create Controller account. This is account that will manage your funds')}:</h3>
              <br />
              <Available label={balanceWrapper('Controller balance')}
                params={controllerAccountId} />
              <ControllerAccountSelector
                onChange={resetControllerInfo}
                senderId={senderId}
                setStepsState={setStepsState}
                stepsState={stepsState}
                title={t('controller account')}
                toggleCreate={toggleCreate}
                value={controllerAccountId}
              />
              {isCreateOpen && (
                <CreateModal
                  onClose={toggleCreate}
                  onStatusChange={onStatusChange}
                />
              )}
            </>
            }
            {currentStep === steps[2] &&
            <>
              <br />
              {!isBalanceEnough() &&
              <h3>
                {t('Now we will transfer some small amount from your account that holds funds to Controller so that it can pay transaction fees {{ transactionFees }}. Just click Next to proceed.', { replace: { transactionFees: formatBalance(transferableAmount) } })}
              </h3>
              }
              { !controllerAlreadyBonded && isBalanceEnough() && (
                <>
                  <h3>{t('Now we need to Bond funds. Bonding means that main account gives control over funds to Controller account.')}
                    <p>{t('Once bonded, funds will be under management of your Controller.')}</p>
                    <p>{t('Money can be unbonded, but will remain locked for a while.')}</p>
                  </h3>
                  <h4 className='ui orange header'>
                    {t('Warning: After bonding, your funds will be locked and will remain locked after the nomination is stopped for')} <EraToTime showBlocks />, {t('which is approximately')} <EraToTime showDays />.
                  </h4>
                  <br />
                  <AddressInfo
                    address={senderId}
                    withBalance={{
                      available: true,
                      bonded: true,
                      free: true,
                      redeemable: true,
                      unlocking: true
                    }}
                    withRewardDestination
                  />
                  <section>
                    <h1>{t('Enter the amount you would like to Bond and click Next:')}</h1>
                    <div className='ui--row'>
                      <div className='large'>
                        <InputBalance
                          label={t('amount to bond')}
                          onChange={setAmount}
                          value={formatBalance(amountToBond, { withUnit: false })}
                        />
                      </div>
                      <Summary className='small'>{t('Bond to controller account. Bond fees and per-transaction fees apply and will be calculated upon submission.')}</Summary>
                    </div>
                  </section>
                </>
              )}
              <br />
            </>
            }
            {currentStep === steps[3] && !isNominated &&
            <>
              <br />
              { controllerAlreadyBonded && (
                <h3>We are ready to nominate. Click Nominate to proceed.</h3>
              )}
            </>
            }
            <Button.Group>
              {!isNominated &&
              <Button
                icon=''
                isDisabled={steps.indexOf(currentStep) === 0}
                key='Back'
                label={t('Back')}
                onClick={goBack}
              />
              }
              {!isNominated &&
              <div className='or'/>
              }
              {currentStep === steps[2] && !isBalanceEnough() && (
                <TxButton
                  accountId={senderId}
                  icon='send'
                  isDisabled={!wholeFees || feesLoading}
                  label={t('Next')}
                  params={[controllerAccountId, transferableAmount]}
                  tx='balances.transfer'
                  withSpinner
                />
              )}
              {currentStep === steps[2] && !controllerAlreadyBonded && isBalanceEnough() && (
                <TxButton
                  accountId={senderId}
                  extrinsic={extrinsic}
                  icon='sign-in'
                  isDisabled={controllerAlreadyBonded}
                  isPrimary
                  label={t('Bond')}
                />
              )}
              {currentStep === steps[3] && controllerAlreadyBonded && (
                <TxButton
                  accountId={controllerAccountId}
                  icon='hand paper outline'
                  isDisabled={!selectedValidators.length || !controllerAlreadyBonded || validatorsLoading}
                  isPrimary
                  label={!isNominated ? t('Nominate') : t('Update Nomination')}
                  params={[selectedValidators]}
                  tx='staking.nominate'
                />
              )}
              {currentStep !== steps[3] && (currentStep !== steps[2] || controllerAlreadyBonded) && (
                <Button
                  className='primary'
                  icon=''
                  isDisabled={disableNext()}
                  key='Next'
                  label={t('Next')}
                  onClick={goNext}
                />
              )}
            </Button.Group>
          </div>
        </>
      )}
      {/* it is great to be reused here to show nomination status */}
      <Actions
        hideNewStake
        isInElection={isInElection}
        next={next}
        ownStashes={ownStashes}
        targets={targets}
        validators={validators}
      />
    </main>
  );
}

export default React.memo(styled(Nomination)`
  .ui.attached.steps {
     display: grid;
     grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`);
