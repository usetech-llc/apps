// Copyright 2020 UseTech authors & contributors
import { imgPath, url, blackList } from '../../constants';
import { Punk } from '../../types';

import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import { Button, AccountSelector } from '@polkadot/react-components';

import TradeContainer from '../TradeContainer';
import useMarketplace from '../../hooks/useMarketplace';
import { roundNum } from '../../utils';

import './styles.scss';

interface Props {
  account: string;
  className?: string;
  setAccount: (account: string | null) => void;
}

function NftPunkDetailsModal({ account, className, setAccount }: Props): React.ReactElement<Props> {
  const [punk, setPunk] = useState<Punk>();
  const [backgroundColor, setBackgroundColor] = useState<string>('#d6adad');
  const [pageState, setPageState] = useState<number>(0);
  const [ownPunk, setOwnPunk] = useState<boolean>(true);
  const [yourPrice, setYourPrice] = useState<number>();
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

  const expandTradeSectionAndStart = useCallback(() => {

  }, []);

  const onSetYourPrice = useCallback((e) => {
    setYourPrice(e.target.value);
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
        { pageState !== 5 && (
          <TradeContainer pageState={pageState} />
        )}

        {/* pageState === 0, 4, 6 */}
        {/* No action, user will click the button */}
        { pageState === 0 && (
          <>
            <p>
              <button onClick={expandTradeSectionAndStart} className="btn">Sell</button>
            </p>
            <p>Also you can use the <a href="https://uniqueapps.usetech.com/#/nft">NFT Wallet</a> to find SubstraPunks
              collection (search for Collection <b>#4</b> there) and transfer your character to someone else. By the
              way, the transfers for SubstraPunks collection are free!</p>
          </>
        )}
        { pageState === 1 && (
          <p>Mining transaction...</p>
        )}
        { pageState === 2 && (
          <p>Waiting for deposit to register in matching engine...</p>
          /* punk.owner = await n.waitForDeposit(punkId, addrList);
          if (punk.owner) pageState = 3;
          else throw 'No connection to Unique node or market contract cannot be reached, try again later.'; */
        )}
        { pageState === 3 && (
          <div className='ask-price'>
            <h3>What is your KSM price?</h3>
            <input
              type="number"
              id="price"
              value={yourPrice}
              onChange={onSetYourPrice}
            />
            <br/>
            <br/>
            <button onClick={setPageState.bind(null, 4)} className="btn">Submit</button>
            <br/>
          </div>
        )}
        { pageState === 5 && (
          <>
            { punk && punk.owner && (
              <p>Owner - someone else: ${punk.owner}</p>
            )}
            { punk && !punk.owner && (
              <p>This NFT is in Escrow. This is temporary status. You can refresh this page in ~30 seconds for more details.</p>
            )}
          </>
        )}
        { (buy && punk) (
          <>
            <p>It's for sale for ${punk.price} KSM, yay!</p>
            <p>
              <button onClick='startBuy();' className="btn">Buy - ${roundNum(parseFloat(punk.price) + fee)} KSM</button>
              <p>Fee: <b>${roundNum(fee)}</b>, Price: <b>${punk.price}</b></p>
            </p>
          </>
        )}
        { ownPunk && punk && (
          <>
            <p><b>You own it!</b> (address ${punk.owner})</p>
            Go to <Link to='/wallet'>My Punks</Link> to see all your tokens
          </>
        )}
        { saling && (
         <>
           <p>
             <b>You own it!</b> (address ${punk.owner})</p><p>... and you have put it on sale. Give it a few minutes to
           appear in the <a href='index.html'>Marketplace</a>.
         </p>
           <p>
             <button onClick='canceltx();' className="btn">Cancel Sale</button>
             <button onClick='window.location="my.html"' className="btn">My Punks</button>
           </p>
         </>
        )}
        <p>
          Also you can use the <Link to='/wallet'>NFT Wallet</Link> to find SubstraPunks collection (search for Collection #4 there) and transfer your character to someone else. By the way, the transfers for SubstraPunks collection are free!
        </p>
        { punkId && blackList.includes(+punkId) && (
          <div className='error-card'>
            This NFT was blacklisted from this marketplace due to fraudlent activities.
          </div>
        )}
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
