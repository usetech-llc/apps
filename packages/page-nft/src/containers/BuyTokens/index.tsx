// Copyright 2020 UseTech authors & contributors

// global app props and types
import { PunkForSaleInterface } from '../../types';
import { url, imgPath } from '../../contants';

// external imports
import React, { memo, ReactElement } from 'react';
import { Route, Switch } from 'react-router-dom'
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

// local imports and components
import useMarketplace from '../../hooks/useMarketplace';
import NftDetailsModal from '../../components/NftDetailsModal';
import './styles.scss';

interface BuyTokensProps {
  className?: string;
}

const BuyTokens = ({ className }: BuyTokensProps): ReactElement<BuyTokensProps> => {
 const { punksForSale } = useMarketplace();

  return (
    <div className='buy-tokens'>
      <Header as='h1'>Buy Tokens</Header>
      <div className='punks-for-sale'>
        { (punksForSale && punksForSale.length > 0) && punksForSale.map((punkForSale: PunkForSaleInterface) => {

          let backgroundColor = 'd6adad';

          if (punkForSale.isOwned) {
            backgroundColor = 'adc9d6';
          } if (punkForSale.price) {
            backgroundColor = 'b8a7ce';
          }

          return (
            <div className='punk' key={punkForSale.id}>
              <div className='punk-card'>
                <a
                  href={`/#/nft/buyTokens/token-details?id=${punkForSale.id}`}
                  title='Punk #${id}'
                >
                  <img
                    alt='Punk ${punkForSale.id}'
                    className='pixelated'
                    src={`${url}${imgPath}/images/punks/image${punkForSale.id}.png`}
                    style={{ backgroundColor }}
                  />
                </a>
              </div>
              <div className='punk-status'>
                { (punkForSale.price && punkForSale.my) && <span>I'm selling: ${punkForSale.price} KSM</span> }
                { (punkForSale.price && !punkForSale.my) && <span>For sale: ${punkForSale.price} KSM</span> }
                { !punkForSale.price && <span>Idle</span> }
              </div>
            </div>
          )
          })}
      </div>
      <Switch>
        <Route
          component={NftDetailsModal}
          path="*/token-details"
          key="TokenDetailsModal"
        />
      </Switch>
    </div>
  )
};

export default memo(BuyTokens);

