// Copyright 2020 UseTech authors & contributors
import React, { useCallback, useEffect } from 'react';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import { Button } from '@polkadot/react-components';

import './tokenDetailsModal.scss';
// import arrayBufferToBase64 from '../utils/arrayBufferToBase64';

interface Props {
  api: any;
  collectionId: string;
  closeModal: () => void;
  tokenId: string;
  tokenImageUrl: string;
}

function TokenDetailsModal({ api, collectionId, closeModal, tokenId, tokenImageUrl }: Props): React.ReactElement<Props> {

  const getTokenDetails = useCallback(async () => {
    if ((!collectionId && collectionId !== '0') || (!tokenId && tokenId !== '0')) {
      return;
    }
  }, [collectionId, tokenId]);

  useEffect(() => {
    void getTokenDetails();
  }, []);

  // {/*<img className='token-image' id="ItemPreview" src={`data:image/png;base64,${arrayBufferToBase64(tokenDetails.Data)}`} />*/}
  return (
    <Modal size='tiny' open onClose={closeModal}>
      <Modal.Header>NFT Token Details</Modal.Header>
      <Modal.Content image>
        <img className='token-image' id="ItemPreview" src={tokenImageUrl} />
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

export default React.memo(TokenDetailsModal);
