// Copyright 2020 UseTech authors & contributors

// global app props and types

// external imports
import React, { memo, useCallback, useEffect, useState, useRef } from 'react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';
import { Table, LabelHelp } from '@polkadot/react-components';

// local imports and components
import { NftCollectionInterface } from '../../hooks/useCollection';
import TransferModal from '../../components/TransferModal/';
import TokenDetailsModal from '../../components/TokenDetailsModal/';
import NftCollectionCard from '../../components/NftCollectionCard';
import CollectionSearch from '../../components/CollectionSearch';
import './styles.scss';

interface NftWalletProps {
  account: string | null;
  className?: string;
}

function NftWallet ({ account, className }: NftWalletProps): React.ReactElement<NftWalletProps> {
  const collectionsStorage = JSON.parse(localStorage.getItem('tokenCollections') || '[]');
  const [openDetailedInformation, setOpenDetailedInformation] = useState<{ collection: NftCollectionInterface, tokenId: string } | null>(null);
  const [openTransfer, setOpenTransfer] = useState<{ collection: NftCollectionInterface, tokenId: string, balance: number } | null>(null);
  const [shouldUpdateTokens, setShouldUpdateTokens] = useState<number | null>(null);
  const [collections, setCollections] = useState<Array<NftCollectionInterface>>(collectionsStorage);
  const [selectedCollection, setSelectedCollection] = useState<NftCollectionInterface | null>(null);
  const [canTransferTokens] = useState<boolean>(true);
  const currentAccount = useRef<string | null | undefined>();

  const addCollection = useCallback((collection: NftCollectionInterface) => {
    setCollections([
      ...collections,
      collection
    ]);
  }, [collections]);

  const removeCollection = useCallback((collectionToRemove) => {
    if (selectedCollection && selectedCollection.id === collectionToRemove) {
      setSelectedCollection(null);
    }
    setCollections(collections.filter(item => item.id !== collectionToRemove));
  }, [collections]);

  const openTransferModal = useCallback((collection, tokenId, balance) => {
    setOpenTransfer({ collection, tokenId, balance });
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



  const updateTokens = useCallback((collectionId) => {
    setShouldUpdateTokens(collectionId);
  }, []);

  useEffect(() => {
    if (currentAccount.current && account !== currentAccount.current) {
      setCollections([]);
    }
    currentAccount.current = account;
  }, [account]);

  useEffect(() => {
    localStorage.setItem('tokenCollections', JSON.stringify(collections));
  }, [collections]);

  console.log('collections', collections);

  return (
    <div className="nft-wallet">
      <CollectionSearch
        account={account}
        addCollection={addCollection}
        collections={collections}
      />
      <br />
      <Header as='h2'>
        My collections
        <LabelHelp
          className='small-help'
          help={'Your tokens are here'}
        />
      </Header>
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
                setShouldUpdateTokens={setShouldUpdateTokens}
                shouldUpdateTokens={shouldUpdateTokens}
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
        />
      )}
      { openTransfer && openTransfer.tokenId && openTransfer.collection && (
        <TransferModal
          account={account}
          balance={openTransfer.balance}
          canTransferTokens={canTransferTokens}
          closeModal={closeTransferModal}
          collection={openTransfer.collection}
          tokenId={openTransfer.tokenId}
          updateTokens={updateTokens}
        />
      )}
    </div>
  );
}

export default memo(NftWallet);
