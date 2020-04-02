// Copyright 2017-2020 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import CreateModal from '@polkadot/app-accounts/Accounts/modals/Create';
import {useApi, useCall, useToggle} from '@polkadot/react-hooks/index';
import styled from 'styled-components';
import {useTranslation} from '@polkadot/app-accounts/translate';
import React, { useState, useEffect } from 'react';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import AccountSelector from './accountSelector';
import ControllerAccountSelector from './controllerAccountSelector';
import BondOrTransfer from './bondOrTransfer';
import {Available} from "@polkadot/react-query/index";
import {AddressInfo, Button, TxButton} from "@polkadot/react-components/index";
import TabsHeader from "@polkadot/app-staking/Nomination/tabsHeader";

const steps = ['choose', 'create', 'transfer', 'bond', 'nominate'];
const stepInitialState = ['', 'disabled', 'disabled', 'disabled', 'disabled'];

interface Props {
  className?: string;
}

function Nomination ({ className }: Props): React.ReactElement<Props> {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [controllerAccountId, setControllerAccountId] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [stepsState, setStepsState] = useState<string[]>(stepInitialState);
  const [isCreateOpen, toggleCreate] = useToggle();
  const [validators, setValidators] = useState<string[]>([]);
  const { api } = useApi();
  const stakingOverview = useCall<DeriveStakingOverview>(api.derive.staking.overview, []);
  // const ownStashes = useOwnStashes();
  const { t } = useTranslation();
  // console.log('ownStashes', ownStashes);
  // console.log('validators', validators);
  // console.log('stakingOverview', stakingOverview);

  function onStatusChange() {

  }

  function balanceWrapper(text: string): React.ReactNode {
    return (
      <strong className='label'>{text}</strong>
    );
  }

  /*useEffect(() => {
    if (controllerAccountId) {
      if (!currentStep) {
        setCurrentStep(steps[1]);
      }
    }
  }, [controllerAccountId]);*/

  // set validators list
  useEffect(() => {
    stakingOverview && setValidators(
      stakingOverview.validators.map((acc): string => acc.toString())
    );
  }, [stakingOverview]);

  // initial step
  useEffect(() => {
    setCurrentStep(steps[0]);
  }, []);

  console.log('senderId', senderId, 'controllerAccountId', controllerAccountId);

  return (
    // in all apps, the main wrapper is setup to allow the padding
    // and margins inside the application. (Just from a consistent pov)
    <main className={`${className} simple-nomination`}>
      {/*<SummaryBar />*/}

      <TabsHeader
        setCurrentStep={setCurrentStep}
        stepsState={stepsState}
        steps={steps}
      />

      <div className="ui attached segment">
        {currentStep === steps[0] &&
        <>
            <Available label={balanceWrapper('Your account balance')} params={senderId} />
            <AccountSelector
                value={senderId}
                title={'Your account'}
                onChange={setSenderId}
                stepsState={stepsState}
                setStepsState={setStepsState}
            />
        </>
        }
        {currentStep === steps[1] &&
        <>
            <Available label={balanceWrapper('Controller balance')} params={controllerAccountId} />
            <ControllerAccountSelector
                value={controllerAccountId}
                title={'controller account'}
                onChange={setControllerAccountId}
                stepsState={stepsState}
                setStepsState={setStepsState}
                toggleCreate={toggleCreate}
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
            <Available label={balanceWrapper('Account balance')} params={senderId} />
            <br />
            <Available label={balanceWrapper('Controller balance')} params={controllerAccountId} />
            <BondOrTransfer
                transfer
                recipientId={controllerAccountId}
                senderId={senderId}
            />
        </>
        }
        {currentStep === steps[3] &&
        <>
            <Available label={balanceWrapper('Account balance')} params={senderId} />
            <br />
            <Available label={balanceWrapper('Account balance')} params={senderId} />
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
            <BondOrTransfer
                recipientId={controllerAccountId}
                senderId={senderId}
            />
        </>
        }
        {currentStep === steps[4] && (
          <Button.Group>
            <TxButton
              accountId={controllerAccountId}
              isDisabled={!validators?.length}
              isPrimary
              params={[validators]}
              label={t('Nominate')}
              icon='hand paper outline'
              tx='staking.nominate'
            />
          </Button.Group>
        )}
      </div>
    </main>
  );
}

export default React.memo(styled(Nomination)`  
  .ui.attached.steps {
     display: grid;
     grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
`);