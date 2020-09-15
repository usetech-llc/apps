// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ActionStatus, QueueAction$Add } from '@polkadot/react-components/Status/types';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { ValidatorInfo } from '@polkadot/app-nomination/types';

import React, {useCallback, useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';
import BN from 'bn.js';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import { useApi, useStashIds } from '@polkadot/react-hooks';
import { Icon, InputAddressMulti, LabelHelp, Modal, Spinner } from '@polkadot/react-components';
import { MAX_NOMINATIONS } from '@polkadot/app-staking/constants';

import useValidators from '../hooks/useValidators';
import RangeComponent from './RangeComponent';
import { ksiRange } from '../utils';
import './BondAndNominationModal.styles.scss';
import useValidatorsFromServer from "@polkadot/app-nomination/hooks/useValidatorsFromServer";

interface Validators {
  next?: string[];
  validators?: string[];
}

interface Props {
  accountId: string | null;
  amountToNominate?: BN | undefined | null;
  isNominating?: boolean;
  nominating?: string[];
  optimalValidators: ValidatorInfo[];
  setIsNominating?: (isNominating: boolean) => void;
  setNominationModalOpened: (open: boolean) => void;
  setNotOptimal?: (notOptimal: boolean) => void;
  stashIsCurrent: boolean;
  stakingOverview?: DeriveStakingOverview | undefined;
  queueAction: QueueAction$Add;
}

function BondAndNominateModal (props: Props): React.ReactElement<Props> {

  const {
    accountId,
    amountToNominate,
    isNominating,
    ksi,
    nominating,
    nominationServerAvailable,
    optimalValidators,
    setIsNominating,
    setKsi,
    setNominationModalOpened,
    stashIsCurrent,
    stakingOverview,
    queueAction,
  } = props;

  const { api } = useApi();
  // const [activeRange, setActiveRange] = useState<Array<number>>([ksi * 6]);
  const [{ validators }, setValidators] = useState<Validators>({});
  const [selectedValidators, setSelectedValidators] = useState<string[]>(nominating || optimalValidators.map(validator => validator.accountId.toString()));
  const allStashes = useStashIds();
  const history = useHistory();

  const extrinsicBond = (amountToNominate && accountId)
    ? api.tx.staking.bond(accountId, amountToNominate, 'Controller')
    : null;

  const extrinsicNominate = (selectedValidators && selectedValidators.length)
    ? api.tx.staking.nominate(selectedValidators)
    : null;

  const startNomination = useCallback(() => {
    if (!extrinsicBond && !extrinsicNominate && !accountId) {
      return;
    }
    // case for bond more with amount and update nomination with only validators
    let transaction = null;
    if (!extrinsicBond && extrinsicNominate) {
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

  useEffect((): void => {
    console.log('allStashes');
    allStashes && stakingOverview && setValidators({
      next: allStashes.filter((address: any) => !stakingOverview.validators.includes(address as any)),
      validators: stakingOverview.validators.map((a: any) => a.toString())
    });
  }, [allStashes, stakingOverview]);

  console.log('activeRange', ksi, 'optimalValidators', optimalValidators);
  return (
    <Modal
      className='range-modal'
      header={
        <>
          <Header as={'h1'}>
            Nomination strategy
            <LabelHelp
              className='small-help'
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
        { nominationServerAvailable && (
          <RangeComponent
            activeRange={[ksiRange.indexOf(ksi)]}
            setActiveRange={setKsi}
          />
        )}
        { (validators && selectedValidators) && (
          <InputAddressMulti
            available={validators}
            availableLabel={'Candidate accounts'}
            defaultValue={selectedValidators}
            help={'Filter available candidates based on name, address or short account index.'}
            maxCount={MAX_NOMINATIONS}
            onChange={setSelectedValidators}
            valueLabel={'Nominated accounts'}
          />
        ) || <Spinner />}
      </Modal.Content>
      <Modal.Actions  cancelLabel={'Cancel'} onCancel={setNominationModalOpened.bind(null, false)}>
        <Button
          icon
          disabled={!selectedValidators || !selectedValidators.length || !amountToNominate || !amountToNominate.gtn(0) || isNominating}
          loading={isNominating}
          onClick={startNomination}
          primary
        >
          {stashIsCurrent ? 'Update nomination' : 'Bond and Nominate'}
          <Icon
            icon={'play'}
          />
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(BondAndNominateModal);
