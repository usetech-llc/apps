// Copyright 2020 UseTech authors & contributors

// global app props and types
import { AppProps as Props } from '@polkadot/react-components/types';
import { ActionStatus } from '@polkadot/react-components/Status/types';

// external imports
import React, { useCallback, useEffect, useState, useRef, useContext } from 'react';
import { useApi } from '@polkadot/react-hooks';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';
import { StatusContext, Table } from '@polkadot/react-components';

// local imports and components
import TransferModal from './components/TransferModal/';
import TokenDetailsModal from './components/TokenDetailsModal/';
import NftCollectionCard from './components/NftCollectionCard';
import { NftCollectionInterface } from './hooks/useCollection';
import CollectionSearch from './components/CollectionSearch';
import AccountSelector from './components/AccountSelector';
import FormatBalance from './components/FormatBalance';
import useBalance from './hooks/useBalance';
import './styles.scss';

function App ({ className }: Props): React.ReactElement<Props> {
  const { queueAction } = useContext(StatusContext);
  const collectionsStorage = JSON.parse(localStorage.getItem('tokenCollections') || '[]');
  const [openDetailedInformation, setOpenDetailedInformation] = useState<{ collection: NftCollectionInterface, tokenId: string } | null>(null);
  const [openTransfer, setOpenTransfer] = useState<{ collectionId: number, tokenId: string } | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const { api } = useApi();
  const [collections, setCollections] = useState<Array<NftCollectionInterface>>(collectionsStorage);
  const [selectedCollection, setSelectedCollection] = useState<NftCollectionInterface | null>(null);
  const [canTransferTokens, setCanTransferTokens] = useState<boolean>(false);
  const { balance, existentialDeposit } = useBalance(account, api);
  const currentAccount = useRef<string | null | undefined>();

  const addCollection = useCallback(({ id, name, prefix, description, offchainSchema }: NftCollectionInterface) => {
    setCollections([ ...collections, { id, name, prefix, description, offchainSchema } ]);
  }, [collections]);

  const removeCollection = useCallback((collectionToRemove) => {
    if (selectedCollection && selectedCollection.id === collectionToRemove) {
      setSelectedCollection(null);
    }
    setCollections(collections.filter(item => item.id !== collectionToRemove));
  }, [collections]);

  const openTransferModal = useCallback((collectionId, tokenId) => {
    setOpenTransfer({ collectionId, tokenId });
  }, []);

  const closeTransferModal = useCallback(() => {
    setOpenTransfer(null);
  }, []);

  const openDetailedInformationModal = useCallback((collection: NftCollectionInterface, tokenId: string) => {
    setOpenDetailedInformation({ collection, tokenId });
  }, []);

  const closeDetailedInformationModal = useCallback(() => {
    setOpenDetailedInformation(null);
  }, []);

  const tokenUrl = useCallback((collection, tokenId: string): string => {
    if (collection.offchainSchema.indexOf('image{id}.pn') !== -1) {
      return collection.offchainSchema.replace('image{id}.pn', `image${tokenId}.png`)
    }
    if (collection.offchainSchema.indexOf('image{id}.jp') !== -1) {
      return collection.offchainSchema.replace('image{id}.jp', `image${tokenId}.jpg`)
    }
    return '';
  },  []);

  useEffect(() => {
    if (currentAccount.current && account !== currentAccount.current) {
      setCollections([]);
    }
    currentAccount.current = account;
  }, [account]);

  useEffect(() => {
    localStorage.setItem('tokenCollections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    if (existentialDeposit && balance) {
      if (balance.free.sub(existentialDeposit).gtn(0)) {
        setCanTransferTokens(true);
      } else {
        setCanTransferTokens(false);
        const message: ActionStatus = {
          action: `low balance`,
          message: 'Your balance is too low to transfer tokens!',
          status: 'error'
        };

        queueAction([message]);
      }
    }
  }, [balance, existentialDeposit]);

  return (
    <main className="nft--App">
      <header>
        <Header as='h1'>Usetech NFT wallet</Header>
      </header>
      <Header as='h2'>Account</Header>
      <Grid className='account-selector'>
        <Grid.Row>
          <Grid.Column width={12}>
            <AccountSelector onChange={setAccount} />
          </Grid.Column>
          <Grid.Column width={4}>
            { balance && (
              <div className='balance-block'>
                <label>Your account balance is:</label>
                <FormatBalance value={balance.free} className='balance' />
              </div>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Header as='h2'>Find token</Header>
      <CollectionSearch
        account={account}
        addCollection={addCollection}
        api={api}
        collections={collections}
      />
      <br />
      <Header as='h2'>My collections</Header>
      <Table
        empty={'No collections added'}
        header={[]}
      >
        { collections.map((collection) => (
          <tr key={collection.id}>
            <td className='overflow'>
              <NftCollectionCard
                account={account}
                canTransferTokens={canTransferTokens}
                collection={collection}
                openTransferModal={openTransferModal}
                openDetailedInformationModal={openDetailedInformationModal}
                removeCollection={removeCollection}
                tokenUrl={tokenUrl}
              />
            </td>
          </tr>
        ))}
      </Table>
      { openDetailedInformation && (
        <TokenDetailsModal
          collection={openDetailedInformation.collection}
          closeModal={closeDetailedInformationModal}
          tokenId={openDetailedInformation.tokenId}
          tokenUrl={tokenUrl}
        />
      )}
      { openTransfer && (
        <TransferModal
          account={account}
          api={api}
          canTransferTokens={canTransferTokens}
          closeModal={closeTransferModal}
          collectionId={openTransfer.collectionId}
          tokenId={openTransfer.tokenId}
        />
      )}
    </main>
  );
}

export default React.memo(App);
