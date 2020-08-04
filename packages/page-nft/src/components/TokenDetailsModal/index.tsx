// Copyright 2020 UseTech authors & contributors
import React, { useCallback, useEffect, useState } from 'react';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';
import Dimmer from 'semantic-ui-react/dist/commonjs/modules/Dimmer';

import './tokenDetailsModal.scss';
import useCollection from '../../hooks/useCollection';
// import arrayBufferToBase64 from '../utils/arrayBufferToBase64';

interface Props {
  api: any;
  collectionId: string;
  closeModal: () => void;
  tokenId: string;
}

function TokenDetailsModal({ api, collectionId, closeModal, tokenId }: Props): React.ReactElement<Props> {
  const { getCollectionImagesUrl } = useCollection(api);
  const [tokenDetails, setTokenDetails] = useState<string | null>(null);

  const getTokenDetails = useCallback(async () => {
    if ((!collectionId && collectionId !== '0') || (!tokenId && tokenId !== '0')) {
      return;
    }
    // const details = (await getDetailedTokenInfo(collectionId, tokenId));
    const details = (await getCollectionImagesUrl(collectionId)) as string;
    setTokenDetails(details);
  }, [collectionId, tokenId]);

  useEffect(() => {
    void getTokenDetails();
  }, []);

  // {/*<img className='token-image' id="ItemPreview" src={`data:image/png;base64,${arrayBufferToBase64(tokenDetails.Data)}`} />*/}
  return (
    <Modal size='tiny' open onClose={closeModal}>
      <Modal.Header>NFT Token Details</Modal.Header>
      <Modal.Content image>
        { tokenDetails && (
          <img className='token-image' id="ItemPreview" src={`${tokenDetails}/punk${tokenId}.png`} />
        ) || (
          <Dimmer active>
            <Loader>Loading token details...</Loader>
          </Dimmer>
        )}
      </Modal.Content>
      <Modal.Actions>
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

export default React.memo(TokenDetailsModal);
