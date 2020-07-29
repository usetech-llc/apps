// Copyright 2020 UseTech authors & contributors
import React from 'react';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Input from 'semantic-ui-react/dist/commonjs/elements/Input/Input';

import './newAccountModal.scss';
import Form from "semantic-ui-react/dist/commonjs/collections/Form";

interface Props {
  isModalOpened: boolean;
  closeModal: () => void;
  goal: string;
}

function NewAccountModal({ closeModal, goal, isModalOpened }: Props): React.ReactElement<Props> {
  return (
    <Modal size='tiny' open={isModalOpened} onClose={closeModal}>
      <Modal.Header>NFT Token Details</Modal.Header>
      <Modal.Content image>
        { goal === 'create' && (
          <Form className='create-account-form'>
            <Form.Field>
              <label>Name</label>
              <Input type='text' placeholder='name your new account' />
            </Form.Field>
            <Form.Field>
              <label>Mnemonic phrase</label>
              <Input type='text' placeholder='seeds phrase for your account' />
            </Form.Field>
            <Form.Field>
              <label>Enter Password</label>
              <Input type='password' />
            </Form.Field>
            <Form.Field>
              <label>Repeat Password</label>
              <Input type='password' />
            </Form.Field>
          </Form>
        )}
        { goal === 'import' && (
          <Form className='import-account-form'>
            <Form.Field>
              <label>Name</label>
              <Input type='text' placeholder='name your new account' />
            </Form.Field>
            <Form.Field>
              <label>Select your account backup file</label>
              <Input type='file' />
            </Form.Field>
            <Form.Field>
              <label>Enter Password</label>
              <Input type='password' />
            </Form.Field>
          </Form>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={closeModal}>
          Cancel
        </Button>
        <Button
          positive
          icon='checkmark'
          labelPosition='right'
          content="Ok"
          onClick={closeModal}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(NewAccountModal);
