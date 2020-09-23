// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ActionStatus, QueueAction$Add } from '@polkadot/react-components/Status/types';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ValidatorInfo } from '@polkadot/app-nomination/types';

import React, {useCallback, useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';
import BN from 'bn.js';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import { useApi, useStashIds } from '@polkadot/react-hooks';
import { InputAddressMulti, LabelHelp, Modal, Spinner, Toggle } from '@polkadot/react-components';
import { MAX_NOMINATIONS } from '@polkadot/app-staking/constants';
import RangeComponent from './RangeComponent';
import { ksiRange } from '../utils';
import './BondAndNominationModal.styles.scss';

interface Validators {
  next?: string[];
  validators?: string[];
}

interface Props {
  accountId: string | null;
  amountToNominate?: BN | undefined | null;
  bondMore?: boolean;
  isNominating?: boolean;
  ksi: number;
  nominating?: string[];
  nominationServerAvailable: boolean;
  optimalValidators: ValidatorInfo[];
  setIsNominating?: (isNominating: boolean) => void;
  setNotOptimal?: (notOptimal: boolean) => void;
  setKsi: (ksi: number) => void;
  stashIsCurrent: boolean;
  stakingOverview?: DeriveStakingOverview | undefined;
  toggleNominationModal: () => void;
  validatorsFromServerLoading: boolean;
  queueAction: QueueAction$Add;
}

function BondAndNominateModal (props: Props): React.ReactElement<Props> {

  const {
    accountId,
    amountToNominate,
    bondMore,
    isNominating,
    ksi,
    nominating,
    nominationServerAvailable,
    optimalValidators,
    setIsNominating,
    setKsi,
    stashIsCurrent,
    stakingOverview,
    queueAction,
    toggleNominationModal,
    validatorsFromServerLoading,
  } = props;

  const { api } = useApi();
  const [{ validators }, setValidators] = useState<Validators>({});
  const [manualStrategy, setManualStrategy] = useState<boolean>(false);
  const [extrinsicBond, setExtrinsicBond] = useState<SubmittableExtrinsic<'promise'> | null>(null);
  const [extrinsicBondMore, setExtrinsicBondMore] = useState<SubmittableExtrinsic<'promise'> | null>(null);
  const [extrinsicNominate, setExtrinsicNominate] = useState<SubmittableExtrinsic<'promise'> | null>(null);
  const [selectedValidators, setSelectedValidators] = useState<string[]>(nominating || optimalValidators.map(validator => validator.accountId.toString()));
  const allStashes = useStashIds();
  const history = useHistory();

  const startNomination = useCallback(() => {
    if (!extrinsicBond && !extrinsicNominate && !accountId) {
      return;
    }
    // case for bond more with amount and update nomination with only validators
    let transaction = null;
    if (extrinsicBondMore) {
      transaction = extrinsicBondMore;
    } else if (!extrinsicBond && extrinsicNominate) {
      transaction = extrinsicNominate;
    } else if (extrinsicBond && extrinsicNominate) {
      const txs = [extrinsicBond, extrinsicNominate];
      transaction =  api.tx.utility.batch(txs)
    }

    if (transaction && accountId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      transaction.signAndSend(accountId, ({ status }) => {
        if (status.isReady) {
          setIsNominating && setIsNominating(true);
        }

        if (status.isInBlock) {
          const message: ActionStatus = {
            action: `included in ${status.asInBlock as unknown as string}`,
            message: 'Funds nominated successfully!',
            status: 'success'
          };

          history.push('/manage');
          queueAction([message]);
          setIsNominating && setIsNominating(false);
        }
      });
    }
  }, [accountId, api.tx.utility, extrinsicBond, extrinsicNominate, queueAction]);

  const changeStrategy = useCallback((type) => {
    setManualStrategy(type);
    if (type === false) {
      setKsi(3);
    }
  }, [setKsi]);

  const setActiveRange = useCallback((range) => {
    setKsi(range);
    setManualStrategy(false);
  }, [setKsi]);

  useEffect((): void => {
    allStashes && stakingOverview && setValidators({
      next: allStashes.filter((address: any) => !stakingOverview.validators.includes(address as any)),
      validators: stakingOverview.validators.map((a: any) => a.toString())
    });
  }, [allStashes, stakingOverview]);

  useEffect(() => {
    setSelectedValidators(optimalValidators.map(validator => validator.accountId.toString()));
  }, [optimalValidators]);

  useEffect(() => {
    if (amountToNominate && accountId) {
      setExtrinsicBond(api.tx.staking.bond(accountId, amountToNominate, 'Controller'));
    }
  }, [accountId, amountToNominate]);

  useEffect(() => {
    if (bondMore && amountToNominate) {
      setExtrinsicBondMore(api.tx.staking.bondExtra(amountToNominate));
    }
  }, [amountToNominate, bondMore]);

  useEffect(() => {
    if (selectedValidators && selectedValidators.length) {
      setExtrinsicNominate(api.tx.staking.nominate(selectedValidators));
    }
  }, [selectedValidators]);

  return (
    <Modal
      className='range-modal'
      header={
        <>
          <Header as={'h1'}>
            Nomination strategy
            <LabelHelp
              className='small-help'
              description={'Help description'}
              help={'Nomination strategy'}
            />
          </Header>
          <div className='divider' />
        </>
      }
      size='large'
    >
      <Modal.Content>
        <Header as='h2'>
          Choose your nomination strategy
        </Header>
        <Toggle
          className={'blue-toggle'}
          label='Auto'
          labelRight='Manual'
          onChange={changeStrategy}
          value={manualStrategy}
        />
        { nominationServerAvailable && (
          <RangeComponent
            activeRange={[ksiRange.indexOf(ksi)]}
            setActiveRange={setActiveRange}
          />
        )}
        { (validators && selectedValidators && !validatorsFromServerLoading) && (
          <InputAddressMulti
            available={validators}
            availableLabel={'Candidate accounts'}
            defaultValue={selectedValidators}
            help={'Filter available candidates based on name, address or short account index.'}
            maxCount={MAX_NOMINATIONS}
            onChange={setSelectedValidators}
            setManualStrategy={changeStrategy}
            valueLabel={'Nominated accounts'}
          />
        ) || <><br /><Spinner /></>}
      </Modal.Content>
      <Modal.Actions  cancelLabel={'Cancel'} onCancel={toggleNominationModal}>
        <Button
          disabled={!selectedValidators || !selectedValidators.length || !amountToNominate || !amountToNominate.gtn(0) || isNominating}
          loading={isNominating}
          onClick={startNomination}
          primary
        >
          {stashIsCurrent ? 'Update nomination' : 'Bond and Nominate'}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(BondAndNominateModal);
