// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React, { useState } from 'react';
import { InputAddress, InputBalance, LabelHelp, Modal } from '@polkadot/react-components';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import ValidateAmount from './InputValidateAmount';
import Available from '../../components/Available';
import TxButton from '../../components/TxButton';
import '../../components/BondAndNominationModal.styles.scss';

interface Props {
  amount?: BN | null;
  onClose: () => void;
  stashId: string;
}

const ZERO = new BN(0);

function BondExtra ({ amount, onClose, stashId }: Props): React.ReactElement<Props> {
  const [amountError, setAmountError] = useState<string | null>(null);
  const [maxAdditional, setMaxAdditional] = useState<BN | undefined>();
  const [maxBalance] = useState<BN | undefined>();

  return (
    <Modal
      className="range-modal"
      header={
        <>
          <Header as={'h1'}>
            Bond more funds
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
          <Modal.Column>
            <p>{'Since this transaction deals with funding, the stash account will be used.'}</p>
          </Modal.Column>
        </Modal.Columns>
        <Modal.Columns>
          <Modal.Column>
            <InputBalance
              autoFocus
              defaultValue={amount || undefined}
              isError={!!amountError || !maxAdditional || maxAdditional.eqn(0)}
              labelExtra={
                <Available
                  className='available-balance'
                  params={stashId}
                />
              }
              maxValue={maxBalance}
              onChange={setMaxAdditional}
            />
            <Header as={'h2'}>
              Additional bonded funds
              <LabelHelp
                className='small-help'
                help={'Amount to add to the currently bonded funds. This is adjusted using the available funds on the account.'}
              />
            </Header>
            <ValidateAmount
              accountId={stashId}
              onError={setAmountError}
              value={maxAdditional}
            />
          </Modal.Column>
          <Modal.Column>
            <p>Ensure that not all funds are locked, funds need to be available for fees.</p>
          </Modal.Column>
        </Modal.Columns>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={stashId}
          isDisabled={!maxAdditional || !maxAdditional.gt(ZERO)}
          isPrimary
          label={'Bond more'}
          onStart={onClose}
          params={[maxAdditional]}
          tx='staking.bondExtra'
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(BondExtra);
