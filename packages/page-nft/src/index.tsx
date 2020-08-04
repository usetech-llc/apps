// Copyright 2020 UseTech authors & contributors

// global app props and types
import { AppProps as Props } from '@polkadot/react-components/types';
import { ActionStatus } from '@polkadot/react-components/Status/types';
// import { MessageInterface } from './components/types';

// external imports
import React, { useCallback, useEffect, useState, useRef, useContext } from 'react';
import { useApi } from '@polkadot/react-hooks';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';
import List from 'semantic-ui-react/dist/commonjs/elements/List/List';
import Card from 'semantic-ui-react/dist/commonjs/views/Card/Card';
import Item from 'semantic-ui-react/dist/commonjs/views/Item/Item';
import { StatusContext } from '@polkadot/react-components';

// local imports and components
import TransferModal from './components/TransferModal/';
import TokenDetailsModal from './components/TokenDetailsModal/';
import NftTokenCard from './components/NftTokenCard';
import NftCollectionCard from './components/NftCollectionCard';
import useCollection, { NftCollectionInterface } from './hooks/useCollection';
import CollectionSearch from './components/CollectionSearch';
// import MessageWrapper from './components/MessageWrapper';
import useBalance from './hooks/useBalance';
import './styles.scss';

function App ({ className }: Props): React.ReactElement<Props> {
  const { queueAction } = useContext(StatusContext);
  const [openDetailedInformation, setOpenDetailedInformation] = useState<string | null>(null);
  const [openTransfer, setOpenTransfer] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const { api } = useApi();
  const [collections, setCollections] = useState<Array<NftCollectionInterface>>([]);
  const [selectedCollection, setSelectedCollection] = useState<NftCollectionInterface | null>(null);
  const [tokensOfCollection, setTokensOfCollection] = useState<Array<string>>([]);
  // const [messages, setMessages] = useState<Array<MessageInterface>>([]);
  const [canTransferTokens, setCanTransferTokens] = useState<boolean>(false);
  const { getTokensOfCollection } = useCollection(api);
  const { balance, existentialDeposit } = useBalance(account, api);
  const currentAccount = useRef<string>();

  const addCollection = useCallback(({ id, name, prefix, description }: NftCollectionInterface) => {
    setCollections([ ...collections, { id, name, prefix, description } ]);
  }, [collections]);

  const removeCollection = useCallback((collectionToRemove) => {
    if (selectedCollection && selectedCollection.id === collectionToRemove) {
      setSelectedCollection(null);
    }
    setCollections(collections.filter(item => item.id !== collectionToRemove));
  }, [collections]);

  // // Retrieve the last timestamp
  // const now = await api.query.timestamp.now();
  // // Retrieve the account balance & nonce via the system module
  // const { nonce, data: balance } = await api.query.system.account(ADDR);

  const openDetailedInformationModal = useCallback((tokenId: string) => {
    setOpenDetailedInformation(tokenId);
  }, []);

  const closeDetailedInformationModal = useCallback(() => {
    setOpenDetailedInformation(null);
  }, []);

  const openTransferModal = useCallback((tokenId) => {
    setOpenTransfer(tokenId);
  }, []);

  const closeTransferModal = useCallback(() => {
    setOpenTransfer(null);
  }, []);

  const selectCollection = useCallback(async (collectionId) => {
    const currentCollection = collections.find(collectionItem => collectionItem.id === collectionId);
    if (currentCollection) {
      setSelectedCollection(currentCollection);
    }
    if (account) {
      const tokensOfCollection = (await getTokensOfCollection(collectionId, account));
      setTokensOfCollection(tokensOfCollection);
    }
  }, [account, getTokensOfCollection, setSelectedCollection]);

  /* const pushMessage = useCallback((newMessage: MessageInterface) => {
    const pushedMessages = [...messages];
    pushedMessages.push(newMessage);
    setMessages(pushedMessages);
    setTimeout(() => {
      popMessage();
    }, 10000);
  }, []);

  const popMessage = useCallback(() => {
    const poppedMessages = [...messages];
    poppedMessages.pop();
    setMessages(poppedMessages);
  }, []); */

  useEffect(() => {
    if (account && account !== currentAccount.current) {
      setCollections([]);
      setTokensOfCollection([]);
      setSelectedCollection(null);
      currentAccount.current = account;
    }
  }, [account]);

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
        /* pushMessage({
          warning: true,
          messageText: `Your balance is too low to transfer tokens!`
        }); */
      }
    }
  }, [balance, existentialDeposit]);

  // @todo existential balance?
  // @todo address validation
  // @todo Костя, кстати, проверь как ты делаешь декодинг UTF-16 строк. Смотри, вот тут:
  //
  // https://www.browserling.com/tools/utf16-decode
  //
  // если ввести \u{0041} или \u{41}, то декодирует в "A".
  return (
    <div className="App">
      <>
        <Header as='h1'>Usetech NFT wallet</Header>
        <CollectionSearch
          account={account}
          addCollection={addCollection}
          api={api}
          balance={balance ? balance.free : null}
          collections={collections}
          setAccount={setAccount}
        />
        <br />
        <Card className='current-tokens'>
          <Grid divided>
            <Grid.Row>
              <Grid.Column width={6}>
                <Header as='h2'>List of collections</Header>
                <List>
                  { collections.map((collection) => (
                    <List.Item key={collection.id}>
                      <NftCollectionCard
                        collection={collection}
                        currentCollectionId={collection.id}
                        selectCollection={selectCollection}
                        removeCollection={removeCollection}
                      />
                    </List.Item>
                  ))}
                </List>
              </Grid.Column>
              <Grid.Column width={10}>
                <Header as='h2'>List of NFT tokens</Header>
                { (selectedCollection && tokensOfCollection && tokensOfCollection.length > 0) && (
                  <Item.Group divided className='nft-wallets'>
                    { tokensOfCollection.map((token) => (
                      <NftTokenCard
                        canTransferTokens={canTransferTokens}
                        collectionPrefix={selectedCollection.prefix}
                        key={token}
                        openTransferModal={openTransferModal}
                        openDetailedInformationModal={openDetailedInformationModal}
                        tokenId={token}
                      />
                    ))}
                  </Item.Group>
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card>
      </>
      { (selectedCollection && selectedCollection.id) && (
        <>
          { openDetailedInformation && (
            <TokenDetailsModal
              api={api}
              collectionId={selectedCollection.id}
              closeModal={closeDetailedInformationModal}
              tokenId={openDetailedInformation}
            />
          )}
          { openTransfer && (
            <TransferModal
              account={account}
              api={api}
              canTransferTokens={canTransferTokens}
              closeModal={closeTransferModal}
              collectionId={selectedCollection.id}
              tokenId={openTransfer}
            />
          )}
        </>
      )}
      {/*<MessageWrapper
        messages={messages}
      />*/}
    </div>
  );
}

export default React.memo(App);
