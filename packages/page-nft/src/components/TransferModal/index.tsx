// Copyright 2020 UseTech authors & contributors
import { MessageInterface } from '../types';

import React, { useState, useCallback, ChangeEvent } from 'react';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form/Form';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button'
import Input, { InputOnChangeData } from 'semantic-ui-react/dist/commonjs/elements/Input/Input';

import './transferModal.scss';
import useTransfer from '../../hooks/useTransfer';
import useBalance from "../../hooks/useBalance";

interface Props {
  account: string | null;
  api?: any;
  canTransferTokens: boolean;
  collectionId: string | null;
  closeModal: () => void;
  tokenId: string | null;
  pushMessage: (message: MessageInterface) => void;
}

function TransferModal({ account, api, canTransferTokens, collectionId, closeModal, tokenId, pushMessage }: Props): React.ReactElement<Props> {
  const { transferToken } = useTransfer(account, api);
  const [recipient, setRecipient] = useState<string | null>(null);
  const { balance } = useBalance(recipient, api);
  // @ts-ignore
  const [validationError, setValidationError] = useState<string | null>(null);

  const onTransfer = () => {
    if (!collectionId || !tokenId || !recipient) {
      return;
    }
    void transferToken(collectionId, tokenId, recipient, pushMessage);
    closeModal();
  };

  const setRecipientAddress = useCallback((e: ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    // setRecipient
    if (!data.value) {
      console.log('setRecipientAddress error');
    }
    if(data.value.length !== '5D73wtH5pqN99auP4b6KQRQAbketaSj4StkBJxACPBUAUdiq'.length) {
      setValidationError('Wrong address');
    }
    setRecipient(data.value);
  }, []);
  console.log('balance', balance);
  return (
    <Modal size='tiny' open onClose={closeModal}>
      <Modal.Header>Transfer NFT Token</Modal.Header>
      <Modal.Content image>
        <Form className='transfer-form'>
          <Form.Field>
            <label>Please enter an address you want to transfer</label>
            <Input onChange={setRecipientAddress} placeholder='Recipient address' />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={closeModal}>
          Cancel
        </Button>
        <Button
          disabled={!canTransferTokens}
          positive
          icon='checkmark'
          labelPosition='right'
          content="Submit"
          onClick={onTransfer}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(TransferModal);
