// Copyright 2020 UseTech authors & contributors
import BN from 'bn.js';
import React, { ChangeEvent, useCallback, useState } from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Input, { InputOnChangeData } from 'semantic-ui-react/dist/commonjs/elements/Input';
import Card from 'semantic-ui-react/dist/commonjs/views/Card';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';

import useCollection from '../../hooks/useCollection';
import AccountSelector from '../AccountSelector';
import NewAccountModal from '../NewAccountModal';
import FormatBalance from '../FormatBalance';
import decodeUTF16LE from '../utils/decodeUTF16LE';
import './CollectionSearch.scss';

interface Props {
  account: string | null | undefined;
  addCollection: (collection: string, collectionName: string) => void;
  api: any;
  balance: BN | null;
  collections: Array<{ id: string, name: string }>;
  setAccount: (account: string | null) => void;
}

function CollectionSearch({ api, addCollection, account, balance, collections, setAccount }: Props): React.ReactElement<Props> {
  const [openAddAccount, setOpenAddAccount] = useState<boolean>(false);
  const [openImportAccount, setOpenImportAccount] = useState<boolean>(false);
  const [collectionInfo, setCollectionInfo] = useState<any>(null);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [noResults, setNoResults] = useState<boolean>(false);
  const { getDetailedCollectionInfo } = useCollection(api);

  const setCollection = useCallback((e: ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    // setCollection to search
    if (!data.value) {
      return
    }
    setCollectionId(data.value);
  }, []);

  const searchCollection = useCallback(async () => {
    if (!collectionId) {
      return;
    }
    const collectionInf = await getDetailedCollectionInfo(collectionId, account);
    console.log('collectionInf', collectionInf, 'owner', collectionInf.Owner.toString());
    if (collectionInf && collectionInf.Owner && collectionInf.Owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM') {
      setNoResults(false);
      setCollectionInfo(collectionInf);
    } else {
      setCollectionInfo(null);
      setNoResults(true);
    }
  }, [collectionId]);

  const openCreateAccountModal = useCallback(() => {
    setOpenAddAccount(true);
  }, []);

  const closeCreateAccountModal = useCallback(() => {
    setOpenAddAccount(false);
  }, []);

  const openImportAccountModal = useCallback(() => {
    setOpenImportAccount(true);
  }, []);

  const closeImportAccountModal = useCallback(() => {
    setOpenImportAccount(false);
  }, []);

  const hasThisCollection = useCallback((collectionId) => {
    return !!collections.find(collection => collection.id === collectionId);
  }, [collections]);

  return (
    <>
      <Form onSubmit={searchCollection}>
        <Grid>
          <Grid.Row>
            <Grid.Column width={12}>
              <Form.Field>
                <label>Choose your account</label>
                {/*<AccountsDropdown api={api} account={account} setAccount={setAccount} />*/}
                <AccountSelector onChange={setAccount} />
              </Form.Field>
            </Grid.Column>
            <Grid.Column width={4}>
              <Form.Field>
                <label>No accounts?</label>
                <Button.Group>
                  <Button onClick={openCreateAccountModal}>Create new</Button>
                  <Button.Or />
                  <Button onClick={openImportAccountModal}>Import</Button>
                </Button.Group>
              </Form.Field>
            </Grid.Column>
          </Grid.Row>
          { account && (
            <Grid.Row>
              <Grid.Column width={16}>
                <Form.Field>
                  <label>Find and add your token collection</label>
                  <Input onChange={setCollection} action placeholder='Search...' >
                    <input />
                    <Button disabled={!collectionId} type='submit'>Search</Button>
                  </Input>
                </Form.Field>
              </Grid.Column>
            </Grid.Row>
          )}
          { balance && (
            <div className='account-balance'>
              <label>Your account balance is</label>
              <FormatBalance value={balance} className='balance' />
            </div>
          )}
          <Grid.Row>
            <Grid.Column width={16}>
              {(collectionId && collectionInfo) && (
                <Card className='wallet-list-item-card'>
                  <Card.Content>
                    <Grid>
                      <Grid.Row>
                        <Grid.Column width={12}>
                          <Card.Header className='collection-header'>
                            Collection name: <strong>{decodeUTF16LE(collectionInfo.Name).toString()}</strong>
                          </Card.Header>
                        </Grid.Column>
                        <Grid.Column width={4} className='collection-actions'>
                          <Button
                            basic
                            color='green'
                            disabled={hasThisCollection(collectionId)}
                            onClick={addCollection.bind(null, collectionId, decodeUTF16LE(collectionInfo.Name).toString())}
                          >
                            Add collection
                          </Button>
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </Card.Content>
                </Card>
              )}
              { noResults && (
                <h2>No results</h2>
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
      <NewAccountModal
        closeModal={closeImportAccountModal}
        goal='import'
        isModalOpened={openImportAccount}
      />

      <NewAccountModal
        closeModal={closeCreateAccountModal}
        goal='create'
        isModalOpened={openAddAccount}
      />
    </>
  )
}

export default React.memo(CollectionSearch);
