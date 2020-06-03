// Copyright 2017-2020 UseTech @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Input from 'semantic-ui-react/dist/commonjs/elements/Input/Input';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Modal from '@polkadot/react-components/Modal';
// import Button from '@polkadot/react-components/Button';
import { useTranslation } from '../../translate';

interface Props {
  onClose: () => void | Promise<void>;
  onConfirm: (value: string) => void;
}

function SubscribeForm ({ onClose, onConfirm }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [value, setValue] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const error = {
    content: t('Please enter a valid email address'),
    pointing: 'below'
  };

  const checkValidation = useCallback((val) => {
    // eslint-disable-next-line no-useless-escape
    const emailValidation = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (val && !emailValidation.exec(val)) {
      setHasError(true);

      return true;
    } else {
      setHasError(false);

      return false;
    }
  }, []);

  const emailChange = useCallback((e, { value }) => {
    setValue(value);
  }, []);

  const submitEmail = useCallback(() => {
    if (value && !checkValidation(value)) {
      onConfirm(value);
    }
  }, [checkValidation, onConfirm, value]);

  return (
    <Modal
      className='subscription-modal'
      header={t('Staking events subscription')}
      size='tiny'
    >
      <Form
        className='subscription-form'
        onSubmit={submitEmail}
        style={{ padding: '1.5rem 1.75rem' }}
      >
        <Modal.Content className='ui--signer-Signer-Content'>
          <Modal.Column>
            <Form.Field
              control={Input}
              error={hasError ? error : null}
              id='form-input-control-error-email'
              label={'Email'}
              onChange={emailChange}
              placeholder='joe@schmoe.com'
              required
            />
          </Modal.Column>
        </Modal.Content>
        <Modal.Actions onCancel={onClose}>
          <Button
            className='ianIsV'
            content={t('Submit')}
            primary
            type='submit'
          />
        </Modal.Actions>
      </Form>
    </Modal>
  );
}

export default React.memo(styled(SubscribeForm)``);
