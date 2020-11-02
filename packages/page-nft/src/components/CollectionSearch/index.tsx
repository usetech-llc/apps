// Copyright 2020 UseTech authors & contributors

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import { Button, Input, Table } from '@polkadot/react-components';

import useCollection, { NftCollectionInterface } from '../../hooks/useCollection';
import './CollectionSearch.scss';

interface Props {
  account: string | null | undefined;
  addCollection: (item: NftCollectionInterface) => void;
  api: any;
  collections: Array<{ id: number, name: string }>;
}

function CollectionSearch({ api, addCollection, account, collections }: Props): React.ReactElement<Props> {
  const [collectionInfo, setCollectionInfo] = useState<any>(null);
  const [collectionId, setCollectionId] = useState<number | null>(null);
  const [searchString, setSearchString] = useState<string>('');
  const { getDetailedCollectionInfo } = useCollection(api);
  const currentAccount = useRef<string | null | undefined>();

  const setCollection = useCallback((value: string) => {
    setSearchString(value);
    // setCollection to search
    if (!value && value !== '0') {
      return
    }
    setCollectionId(parseInt(value, 10));
  }, []);

  const searchCollection = useCallback(async () => {
    if (!collectionId) {
      return;
    }

    const collectionInf = await getDetailedCollectionInfo(collectionId);

    if (collectionInf && collectionInf.Owner && collectionInf.Owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM') {
      setCollectionInfo({ ...collectionInf, id: collectionId });
    } else {
      setCollectionInfo(null);
    }
  }, [collectionId]);

  const hasThisCollection = useCallback((collectionInfo) => {
    return !!collections.find(collection => collection.id === collectionInfo.id);
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

  const addCollectionToAccount = useCallback(() => {
    if (!collectionId || !collectionInfo) {
      return;
    }
    addCollection({
      id: collectionId,
      decimalPoints: collectionInfo.DecimalPoints.toNumber(),
      description: collectionName16Decoder(collectionInfo.Description),
      name: collectionName16Decoder(collectionInfo.Name),
      offchainSchema: collectionName8Decoder(collectionInfo.OffchainSchema),
      prefix: collectionName8Decoder(collectionInfo.TokenPrefix),
      isReFungible: collectionInfo.Mode.isReFungible,
    })
  }, [addCollection, collectionId, collectionInfo]);

  const header = useMemo(() => [
    ['Search results', 'start'],
    [],
  ], []);

  // clear search results if account changed
  useEffect(() => {
    if (currentAccount.current && currentAccount.current !== account) {
      setCollectionInfo(null);
      setCollectionId(null);
      setSearchString('');
    }
    currentAccount.current = account;
  }, [account]);

  return (
    <Form className='collection-search' onSubmit={searchCollection}>
      <Grid>
        { account && (
          <Grid.Row>
            <Grid.Column width={16}>
              <Form.Field>
                <Input
                  className='explorer--query label-small'
                  label='Find and add your token collection'
                  onChange={setCollection}
                  value={searchString}
                  placeholder='Search...'
                  withLabel
                >
                  <Button
                    icon='play'
                    onClick={searchCollection}
                  />
                </Input>
              </Form.Field>
            </Grid.Column>
          </Grid.Row>
        )}
        <Table
          empty={'No results'}
          header={header}
        >
          {(collectionId && collectionInfo) && (
            <tr className='collection-row'>
              <td className='collection-name'>
                Collection name: <strong>{collectionName16Decoder(collectionInfo.Name)}</strong>
              </td>
              <td className='collection-actions'>
                <Button
                  isBasic
                  isDisabled={hasThisCollection(collectionInfo)}
                  icon='plus'
                  label='Add collection'
                  onClick={addCollectionToAccount}
                />
              </td>
            </tr>
          )}
        </Table>
      </Grid>
    </Form>
  )
}

export default React.memo(CollectionSearch);
