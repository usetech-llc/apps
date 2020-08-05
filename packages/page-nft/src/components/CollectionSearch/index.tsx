// Copyright 2020 UseTech authors & contributors

import React, { ChangeEvent, useCallback, useState } from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Input, { InputOnChangeData } from 'semantic-ui-react/dist/commonjs/elements/Input';
import Card from 'semantic-ui-react/dist/commonjs/views/Card';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';

import useCollection, { NftCollectionInterface } from '../../hooks/useCollection';
import './CollectionSearch.scss';

interface Props {
  account: string | null | undefined;
  addCollection: (item: NftCollectionInterface) => void;
  api: any;
  collections: Array<{ id: string, name: string }>;
}

function CollectionSearch({ api, addCollection, account, collections }: Props): React.ReactElement<Props> {
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

    const collectionInf = await getDetailedCollectionInfo(collectionId);

    if (collectionInf && collectionInf.Owner && collectionInf.Owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM') {
      setNoResults(false);
      setCollectionInfo(collectionInf);
    } else {
      setCollectionInfo(null);
      setNoResults(true);
    }
  }, [collectionId]);

  const hasThisCollection = useCallback((collectionId) => {
    return !!collections.find(collection => collection.id === collectionId);
  }, [collections]);

  const collectionName16Decoder = useCallback((name) => {
    const collectionNameArr = name.map((item: any) => item.toNumber());
    collectionNameArr.splice(-1, 1);
    return String.fromCharCode(...collectionNameArr);
  }, []);

  const collectionName8Decoder = useCallback((name) => {
    const collectionNameArr = Array.prototype.slice.call(name);
    collectionNameArr.splice(-1, 1);
    return String.fromCharCode(...collectionNameArr);
  }, []);

  return (
    <Card className='collection-search'>
      <Form onSubmit={searchCollection}>
        <Grid>
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
          <Grid.Row>
            <Grid.Column width={16}>
              {(collectionId && collectionInfo) && (
                <Card className='wallet-list-item-card'>
                  <Card.Content>
                    <Grid>
                      <Grid.Row>
                        <Grid.Column width={12}>
                          <Card.Header className='collection-header'>
                            Collection name: <strong>{collectionName16Decoder(collectionInfo.Name)}</strong>
                          </Card.Header>
                        </Grid.Column>
                        <Grid.Column width={4} className='collection-actions'>
                          <Button
                            basic
                            color='green'
                            disabled={hasThisCollection(collectionId)}
                            onClick={addCollection.bind(null, {
                              id: collectionId,
                              description: collectionName16Decoder(collectionInfo.Description),
                              name: collectionName16Decoder(collectionInfo.Name),
                              offchainSchema: collectionName8Decoder(collectionInfo.OffchainSchema),
                              prefix: collectionName8Decoder(collectionInfo.TokenPrefix)
                            })}
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
    </Card>
  )
}

export default React.memo(CollectionSearch);
