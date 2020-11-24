// Copyright 2020 UseTech authors & contributors
import { imgPath, url } from '../../constants';

import React, { useCallback, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import { Button } from '@polkadot/react-components';

import TradeContainer from '../TradeContainer';
import './styles.scss';

interface Props {
  account: string;
  className?: string;
}

function NftDetailsModal({ account, className }: Props): React.ReactElement<Props> {
  const [accessories, setAccessories] = useState<Array<string>>([]);
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
    <Modal className="nft-details" size='large' open onClose={closeModal}>
      <Modal.Header>NFT Token Details</Modal.Header>
      <Modal.Content>
        <div className='token-image'>
          <img src={`${url}${imgPath}/images/punks/image${punkId}.png`} />
        </div>
        <div className='token-info'>
          <Header as='h3'>{collectionName} #{punkId}</Header>
          <p><strong>Mail punk</strong></p>
          <Header as='h4'>Accessories</Header>
          { accessories.map((accessory) => (
            <div className='accessory'>Red Glasses</div>
          ))}
          <Header as='h4'>Ownership</Header>
          <p><strong>You own it!</strong> (address: {account})</p>
          <Header as='h4'>Selling this NFT</Header>
        </div>
        <TradeContainer />
        <p>
          Also you can use the <Link to='/wallet'>NFT Wallet</Link> to find SubstraPunks collection (search for Collection #4 there) and transfer your character to someone else. By the way, the transfers for SubstraPunks collection are free!
        </p>
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
