// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ActionStatus, QueueAction$Add } from '@polkadot/react-components/Status/types';

import React, { useCallback, useState } from 'react';
import { Range } from 'react-range';
import BN from 'bn.js';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import { Icon, LabelHelp, Modal } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import './range.scss';
import rangeSvg from './range.svg';
import linesSvg from './lines.svg';

interface Props {
  accountId: string | null;
  amountToNominate: BN | undefined | null;
  isNominating: boolean;
  selectedValidators: string[];
  setIsNominating: (isNominating: boolean) => void;
  stashIsCurrent: boolean;
  toNomination: () => void;
  queueAction: QueueAction$Add;
}

function BondAndNominateModal ({ accountId, amountToNominate, isNominating, selectedValidators, setIsNominating, stashIsCurrent, toNomination, queueAction }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [activeRange, setActiveRange] = useState<Array<number>>([3]);

  const extrinsicBond = (amountToNominate && accountId)
    ? api.tx.staking.bond(accountId, amountToNominate, 'Controller')
    : null;
  const extrinsicNominate = (amountToNominate && accountId)
    ? api.tx.staking.nominate(selectedValidators)
    : null;

  const startNomination = useCallback(() => {
    if (!extrinsicBond || !extrinsicNominate || !accountId) {
      return;
    }

    const txs = [extrinsicBond, extrinsicNominate];

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    api.tx.utility
      .batch(txs)
      .signAndSend(accountId, ({ status }) => {
        if (status.isReady) {
          setIsNominating(true);
        }

        if (status.isInBlock) {
          const message: ActionStatus = {
            action: `included in ${status.asInBlock as unknown as string}`,
            message: 'Funds nominated successfully!',
            status: 'success'
          };

          toNomination();
          queueAction([message]);
          setIsNominating(false);
        }
      });
  }, [accountId, api.tx.utility, extrinsicBond, extrinsicNominate, toNomination, queueAction]);

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
        <div className='range-block'>
          <div className='range-list'>
            <div className='item'>
              Conservative strategy
              <LabelHelp
                className='small-help'
                help='Conservative strategy'
              />
            </div>
            <div className='item' />
            <div className='item' />
            <div className='item' />
            <div className='item' />
            <div className='item' />
            <div className='item'>
              Aggressive strategy
              <LabelHelp
                className='small-help'
                help='Aggressive strategy'
              />
            </div>
          </div>
          <Range
            step={1}
            min={0}
            max={6}
            values={activeRange}
            onChange={setActiveRange}
            renderTrack={({ props, children }) => (
              <div
                className='render-track'
                {...props}
                style={{
                  ...props.style,
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                className='render-thumb'
                {...props}
                children={
                  <>
                    <img src={linesSvg} />
                    <Header as='h2' className='range-header'>
                      Balanced strategy
                      <LabelHelp
                        className='small-help'
                        help='Conservative strategy'
                      />
                      <img className='range-polygon' src={rangeSvg} />
                    </Header>
                  </>
                }
              />
            )}
          />
        </div>
        <span className='strategy-name'>
          <Icon icon='info-circle' />
          Now the 'Balanced strategy' is installed. If you change the candidates below, the strategy will become a 'Manual'
        </span>
      </Modal.Content>
      <Modal.Actions onCancel={() => {}}>
        <Button
          icon
          disabled={!selectedValidators.length || !amountToNominate || !amountToNominate.gtn(0) || isNominating}
          loading={isNominating}
          onClick={startNomination}
          primary
        >
          {stashIsCurrent ? 'Add funds' : 'Bond and Nominate'}
          <Icon
            icon={'play'}
          />
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(BondAndNominateModal);
