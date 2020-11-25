// Copyright 2020 UseTech authors & contributors
import { imgPath, url } from '../../constants';
import { Punk } from '../../types';

import React, {useCallback, useEffect, useState} from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import { Button } from '@polkadot/react-components';

import TradeContainer from '../TradeContainer';
import useMarketplace from '../../hooks/useMarketplace';

import './styles.scss';

interface Props {
  account: string;
  className?: string;
  setAccount: (account: string | null) => void;
}

function NftPunkDetailsModal({ account, className, setAccount }: Props): React.ReactElement<Props> {
  const [punk, setPunk] = useState<Punk>();
  const [backgroundColor, setBackgroundColor] = useState<string>('#d6adad');
  const search = useLocation().search;
  const { loadPunkFromChain } = useMarketplace(account);
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

  const loadPunkInfo = useCallback(async () => {
    if (punkId) {
      const punkInfo = await loadPunkFromChain(punkId) as Punk;
      console.log('punkInfo', punkInfo);
      setPunk(punkInfo);
    }
  }, []);

  useEffect(() => {
    void loadPunkInfo();
  }, [punkId]);

  useEffect(() => {
    if (punk && punk.isOwned) {
      setBackgroundColor('#adc9d6');
    }
    if (punk && punk.price) {
      setBackgroundColor('#b8a7ce');
    }
  }, [punk]);

  console.log('Modal!!!');

  return (
    <Modal className="nft-details" size='large' open onClose={closeModal}>
      <Modal.Header>NFT Token Details</Modal.Header>
      <Modal.Content>
        <div className='token-image' style={{ backgroundColor }}>
          <img src={`${url}${imgPath}/images/punks/image${punkId}.png`} alt='punk' />
        </div>
        <div className='token-info'>
          <Header as='h3'>{collectionName} #{punkId}</Header>
          { punk && (
          <>
            <p><strong>Mail punk</strong></p>
            <Header as='h4'>Accessories</Header>
            <div className='attributes'>
              { punk.attributes.map((accessory) => (
                <div className='accessory' key={accessory}>{accessory}</div>
              ))}
            </div>
            <Header as='h4'>Ownership</Header>
            { punk.owner === account && (
              <p><strong>You own it!</strong> (address: {account})</p>
            )}
            { punk.owner !== account && <p>address: {account}</p> }
          </>
          )}
          {/*<>
            Buying this NFT
            <AccountSelector onChange={setAccount} />
            Unique address to use:
          </>*/}
          {/* <Header as='h4'>Selling this NFT</Header>
          pageState === 4 && <p>
            <button onClick='canceltx();' className="btn">Cancel Sale</button>
            <button onClick='window.location="my.html"' className="btn">My Punks</button>
          </p> */}
          {/* <>
            It's for sale for 0.22 KSM, yay!
            <button>Buy - 0.224 KSM</button>
            Fee: 0.004, Price: 0.22
          </> */}
          {/*
            <>
              Your KSM balance is too low: 0.196433341766
              You need at least: 0.2274 KSM
            </>
          */}
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

export default React.memo(NftPunkDetailsModal);
