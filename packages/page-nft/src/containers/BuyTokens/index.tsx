// Copyright 2020 UseTech authors & contributors

// global app props and types
import { PunkForSaleInterface } from '../../types';
import { url, imgPath } from '../../contants';
import { NftCollectionInterface } from '../../hooks/useCollection';

// external imports
import React, { memo, ReactElement } from 'react';
import { Route, Switch } from 'react-router-dom'
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';
import { Table } from '@polkadot/react-components';

// local imports and components
import useMarketplace from '../../hooks/useMarketplace';
import NftDetailsModal from '../../components/NftDetailsModal';
import NftCollectionCardForSale from '../../components/NftCollectionCardForSale';
import './styles.scss';

interface BuyTokensProps {
  account: string | null;
  className?: string;
}

const collectionsForSale: Array<NftCollectionInterface> = [
  {
    decimalPoints: 0,
    description: 'Remake of classic CryptoPunks game',
    id: 4,
    isReFungible: false,
    name: 'Substrapunks',
    offchainSchema: 'https://ipfs-gateway.usetech.com/ipns/QmaMtDqE9nhMX9RQLTpaCboqg7bqkb6Gi67iCKMe8NDpCE/images/punks/image{id}.pn',
    prefix: 'PNK'
  },
  {
    decimalPoints: 0,
    description: 'The NFT collection for artists to mint and display their work',
    id: 14,
    isReFungible: false,
    name: 'Unique Gallery',
    offchainSchema: 'https://uniqueapps.usetech.com/api/images/{id',
    prefix: 'GAL',
  }
];

const BuyTokens = ({ account, className }: BuyTokensProps): ReactElement<BuyTokensProps> => {
  return (
    <div className='buy-tokens'>
      <Header as='h2'>Buy Tokens</Header>
      <Table
        empty={'No collections added'}
        header={[]}
      >
        { collectionsForSale.map((collection) => (
          <tr key={collection.id}>
            <td className='overflow'>
              <NftCollectionCardForSale
                account={account}
                canTransferTokens
                collection={collection}
                openTransferModal={() => {}}
                openDetailedInformationModal={() => {}}
                shouldUpdateTokens={null}
              />
            </td>
          </tr>
        ))}
      </Table>
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

