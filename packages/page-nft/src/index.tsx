// Copyright 2020 UseTech authors & contributors

// global app props and types
import { AppProps as Props } from '@polkadot/react-components/types';
import { MessageInterface } from './components/types';

// external imports
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useApi } from '@polkadot/react-hooks';
import { web3Enable } from '@polkadot/extension-dapp';
import Container from 'semantic-ui-react/dist/commonjs/elements/Container/Container';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header/Header';
import List from 'semantic-ui-react/dist/commonjs/elements/List/List';
import Card from 'semantic-ui-react/dist/commonjs/views/Card/Card';
import Item from 'semantic-ui-react/dist/commonjs/views/Item/Item';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader/Loader';
import Dimmer from 'semantic-ui-react/dist/commonjs/modules/Dimmer/Dimmer';
import Segment from 'semantic-ui-react/dist/commonjs/elements/Segment/Segment';

// local imports and components
import TransferModal from './components/TransferModal/';
import TokenDetailsModal from './components/TokenDetailsModal/';
import NftTokenCard from './components/NftTokenCard';
import NftCollectionCard from './components/NftCollectionCard';
// import useApi from './hooks/useApi';
import useCollection from './hooks/useCollection';
import CollectionSearch from './components/CollectionSearch';
import MessageWrapper from './components/MessageWrapper';
import useBalance from './hooks/useBalance';
import './styles.scss';


function App ({ className }: Props): React.ReactElement<Props> {
  const [openDetailedInformation, setOpenDetailedInformation] = useState<string | null>(null);
  const [openTransfer, setOpenTransfer] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  // const { api, apiLoading, apiError } = useApi();
  const { api } = useApi();
  const [collections, setCollections] = useState<Array<{ id: string, name: string}>>([]);
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);
  const [web3Enabled, setWeb3Enabled] = useState<boolean>(false);
  const [tokensOfCollection, setTokensOfCollection] = useState<Array<string>>([]);
  const [messages, setMessages] = useState<Array<MessageInterface>>([]);
  const [canTransferTokens, setCanTransferTokens] = useState<boolean>(false);
  const { getTokensOfCollection } = useCollection(api);
  const { balance, existentialDeposit } = useBalance(account, api);
  const currentAccount = useRef<string>();
  const apiError = false;
  const apiLoading = false;

  const setWeb3Status = useCallback( async() => {
    const web3Arr = await web3Enable('');
    if (web3Arr && web3Arr.length) {
      setWeb3Enabled(true);
    }
  }, []);

  const addCollection = useCallback((newCollectionId, collectionName) => {
    setCollections([ ...collections, { id: newCollectionId, name: collectionName } ]);
  }, [collections]);

  const removeCollection = useCallback((collectionToRemove) => {
    if (currentCollectionId === collectionToRemove) {
      setCurrentCollectionId(null);
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
    setCurrentCollectionId(collectionId);
    if (account) {
      const tokensOfCollection = (await getTokensOfCollection(collectionId, account));
      setTokensOfCollection(tokensOfCollection);
    }
  }, [account, getTokensOfCollection, setCurrentCollectionId]);

  const pushMessage = useCallback((newMessage: MessageInterface) => {
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
  }, []);

  useEffect(() => {
    void setWeb3Status();
  }, [setWeb3Status]);

  useEffect(() => {
    if (account && account !== currentAccount.current) {
      setCollections([]);
      setTokensOfCollection([]);
      setCurrentCollectionId(null);
      currentAccount.current = account;
    }
  }, [account]);

  useEffect(() => {
    if (existentialDeposit && balance) {
      if (balance.free.sub(existentialDeposit).gtn(0)) {
        setCanTransferTokens(true);
      } else {
        setCanTransferTokens(false);
        pushMessage({
          warning: true,
          messageText: `Your balance is too low to transfer tokens!`
        });
      }
    }
  }, [balance, existentialDeposit]);

  // @todo existential balance?
  // @todo address validation
  return (
    <div className="App">
      <Container>
        { apiError && (
          <h1 style={{ textAlign: 'center' }}>Something went wrong with api connection</h1>
        )}
        { !apiError && !web3Enabled && (
          <h1 style={{ textAlign: 'center' }}>Please allow access for polkadot extension</h1>
        )}
        { (!apiError && web3Enabled) && (
          <>
            { (!api || apiLoading) && (
              <Dimmer active>
                <Loader>Initializing...</Loader>
              </Dimmer>
            ) || (
              <Segment>
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
                                currentCollectionId={currentCollectionId}
                                selectCollection={selectCollection}
                                removeCollection={removeCollection}
                              />
                            </List.Item>
                          ))}
                        </List>
                      </Grid.Column>
                      <Grid.Column width={10}>
                        <Header as='h2'>List of NFT tokens</Header>
                        { (tokensOfCollection && tokensOfCollection.length > 0) && (
                          <Item.Group divided className='nft-wallets'>
                            { tokensOfCollection.map((token) => (
                              <NftTokenCard
                                canTransferTokens={canTransferTokens}
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
              </Segment>
            )}
          </>
        )}
      </Container>
      { (openDetailedInformation && currentCollectionId) && (
        <TokenDetailsModal
          api={api}
          collectionId={currentCollectionId}
          closeModal={closeDetailedInformationModal}
          tokenId={openDetailedInformation}
        />
      )}
      {(openTransfer && currentCollectionId) && (
        <TransferModal
          account={account}
          api={api}
          canTransferTokens={canTransferTokens}
          closeModal={closeTransferModal}
          collectionId={currentCollectionId}
          tokenId={openTransfer}
          pushMessage={pushMessage}
        />
      )}
      <MessageWrapper
        messages={messages}
      />
    </div>
  );
}

export default React.memo(App);
