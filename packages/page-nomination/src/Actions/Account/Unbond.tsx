// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountId, StakingLedger } from '@polkadot/types/interfaces';

import BN from 'bn.js';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Bonded, InputAddress, InputBalance, LabelHelp, Modal, Static } from '@polkadot/react-components';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import { BlockToTime } from '@polkadot/react-query';

import useUnbondDuration from '../useUnbondDuration';
import TxButton from '../../components/TxButton';
import '../../components/BondAndNominationModal.styles.scss';
import './unbond.scss';

interface Props {
  className?: string;
  controllerId?: string | AccountId | null;
  onClose: () => void;
  stakingLedger?: StakingLedger;
  stashId: string;
}

function Unbond ({ className, controllerId, onClose, stakingLedger, stashId }: Props): React.ReactElement<Props> {
  const bondedBlocks = useUnbondDuration();
  const [maxBalance] = useState<BN | undefined>(stakingLedger ? stakingLedger.active.unwrap() : undefined);
  const [maxUnbond, setMaxUnbond] = useState<BN>();

  const setAllToUnbond = useCallback(() => {
    if (maxBalance) {
    }
    setMaxUnbond(maxBalance);
  }, [maxBalance]);

  return (
    <Modal
      className="range-modal"
      header={
        <>
          <Header as={'h1'}>
            Unbond funds
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
      <Modal.Content className='ui--signer-Signer-Content'>
        <Modal.Columns>
          <Modal.Column>
            <InputAddress
              defaultValue={stashId}
              isDisabled
              label={'Stash account'}
            />
          </Modal.Column>
        </Modal.Columns>
        <Modal.Columns>
          <Modal.Column>
            <InputBalance
              autoFocus
              defaultValue={maxUnbond}
              help={'The amount of funds to unbond, this is adjusted using the bonded funds on the stash account.'}
              label={'Unbond amount'}
              labelExtra={
                <>
                  <Bonded
                    label={<span className='label'>{'Bonded'}</span>}
                    params={stashId}
                  />
                  <Button className='small' onClick={setAllToUnbond}>All</Button>
                </>
              }
              maxValue={maxBalance}
              onChange={setMaxUnbond}
              withMax
            />
            {(bondedBlocks && bondedBlocks.gtn(0)) && (
              <Static
                help={'The bonding duration for any staked funds. After this period needs to be withdrawn.'}
                label={'on-chain bonding duration'}
              >
                <BlockToTime blocks={bondedBlocks} />
              </Static>
            )}
          </Modal.Column>
          <Modal.Column>
            <p>{'The funds will only be available for withdrawal after the unbonding period, however will not be part of the staked amount after the next validator election. You can follow the unlock countdown in the UI.'}</p>
          </Modal.Column>
        </Modal.Columns>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={controllerId}
          isDisabled={!maxUnbond || !maxUnbond.gtn(0)}
          isPrimary
          label={'Unbond'}
          onStart={onClose}
          params={[maxUnbond]}
          tx='staking.unbond'
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(styled(Unbond)`
  .staking--Unbond--max > div {
    justify-content: flex-end;

    & .column {
      flex: 0;
    }
  }
`);
