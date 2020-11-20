// Copyright 2020 UseTech authors & contributors
import { imgPath, url } from '../../constants';

import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import { Button } from '@polkadot/react-components';

import './styles.scss';

interface Props {
  className?: string;
}

function NftDetailsModal({ className }: Props): React.ReactElement<Props> {
  const search = useLocation().search;
  console.log('search', search);

  const useQuery = useCallback(() => {
    return new URLSearchParams(useLocation().search);
  }, []);

  const query = useQuery();
  const punkId = query.get('id');
  const collectionName = query.get('collection');

  const closeModal = useCallback(() => {
    history.back();
  }, []);
  console.log('Modal!!!');


  return (
    <Modal className="nft-details" size='small' open onClose={closeModal}>
      <Modal.Header>NFT Token Details</Modal.Header>
      <Modal.Content>
        <div className='token-image'>
          <img src={`${url}${imgPath}/images/punks/image${punkId}.png`} />
        </div>
        <div className='token-info'>
          <Header as='h3'>{collectionName} #{punkId}</Header>
        </div>
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
