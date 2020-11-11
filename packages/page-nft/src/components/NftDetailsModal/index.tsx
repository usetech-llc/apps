// Copyright 2020 UseTech authors & contributors
import React, { useCallback } from 'react';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import { Button } from '@polkadot/react-components';

import './styles.scss';

interface Props {
  className?: string;
}

function NftDetailsModal({ className }: Props): React.ReactElement<Props> {

  const closeModal = useCallback(() => {

  }, []);
  console.log('Modal!!!');

  return (
    <Modal className="token-details" size='tiny' open onClose={closeModal}>
      <Modal.Header>NFT Token Details</Modal.Header>
      <Modal.Content image>
        <img className='token-image' id="ItemPreview" src='' />
      </Modal.Content>
      <Modal.Actions>
        <Button
          icon='check'
          label='Ok'
          onClick={closeModal}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(NftDetailsModal);
