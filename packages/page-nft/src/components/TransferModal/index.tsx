// Copyright 2020 UseTech authors & contributors

import React, { useState, useCallback } from 'react';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import { Button, Input } from '@polkadot/react-components';

import './transferModal.scss';
import useBalance from "../../hooks/useBalance";
import {TxButton} from "@polkadot/react-components/index";

interface Props {
  account: string | null;
  api?: any;
  canTransferTokens: boolean;
  collectionId: number | null;
  closeModal: () => void;
  tokenId: string | null;
}

function TransferModal({ account, api, canTransferTokens, collectionId, closeModal, tokenId }: Props): React.ReactElement<Props> {
  const [recipient, setRecipient] = useState<string | null>(null);
  const { balance } = useBalance(recipient, api);
  // @ts-ignore
  const [validationError, setValidationError] = useState<string | null>(null);

  const setRecipientAddress = useCallback((value) => {
    // setRecipient
    if (!value) {
      console.log('setRecipientAddress error');
    }
    if(value.length !== '5D73wtH5pqN99auP4b6KQRQAbketaSj4StkBJxACPBUAUdiq'.length) {
      setValidationError('Wrong address');
    }
    setRecipient(value);
  }, []);
  console.log('balance', balance);

  // @todo address validation

  return (
    <Modal size='tiny' open onClose={closeModal}>
      <Modal.Header>
        <h2>Transfer NFT Token</h2>
      </Modal.Header>
      <Modal.Content image>
        <Form className='transfer-form'>
          <Form.Field>
            <Input
              className='label-small'
              label='Please enter an address you want to transfer'
              onChange={setRecipientAddress}
              placeholder='Recipient address'
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button
          icon='times'
          label='Cancel'
          onClick={closeModal}
        />
        <TxButton
          accountId={account}
          isDisabled={!canTransferTokens}
          label='Submit'
          onStart={closeModal}
          params={[recipient, collectionId, tokenId, 0]}
          tx='nft.transfer'
        />
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(TransferModal);
