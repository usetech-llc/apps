// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React from 'react';
import { InputAddress, LabelHelp, Modal } from '@polkadot/react-components';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import TxButton from '../../components/TxButton';
import '../../components/BondAndNominationModal.styles.scss';

interface Props {
  amount?: BN | null;
  isStashNominating: boolean;
  onClose: () => void;
  stashId: string;
}

function StopNomination ({ isStashNominating, onClose, stashId }: Props): React.ReactElement<Props> {

  return (
    <Modal
      className="range-modal"
      header={
        <>
          <Header as={'h1'}>
            Stop nomination
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
              label={'Your account'}
            />
          </Modal.Column>
          <Modal.Column>
            <p>This operation only stops the nomination selection, it does not unbond your funds. You can use "Unbond" operation for that, or can choose "Update nomination" to make a new selection of validators</p>
          </Modal.Column>
        </Modal.Columns>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={stashId}
          isDisabled={!isStashNominating}
          isPrimary
          label={'Stop'}
          onStart={onClose}
          params={[]}
          tx='staking.chill'
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(StopNomination);
