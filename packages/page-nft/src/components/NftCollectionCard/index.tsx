// Copyright 2020 UseTech authors & contributors
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Item from 'semantic-ui-react/dist/commonjs/views/Item';
import { ExpanderWithCallBack } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

import useCollection, { NftCollectionInterface } from '../../hooks/useCollection';
import './NftCollectionCard.scss';

interface Props {
  account: string | null;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  removeCollection: (collection: number) => void;
  openTransferModal: (collectionId: number, tokenId: string) => void;
  openDetailedInformationModal: (collection: NftCollectionInterface, tokenId: string) => void;
  setShouldUpdateTokens: (collectionId: number | null) => void;
  shouldUpdateTokens: number | null;
  tokenUrl: (collection: NftCollectionInterface, tokenId: string) => string;
}

function NftCollectionCard({ account, canTransferTokens, collection, removeCollection, openTransferModal, openDetailedInformationModal, setShouldUpdateTokens, shouldUpdateTokens, tokenUrl }: Props): React.ReactElement<Props> {
  const [opened, setOpened] = useState(false);
  const [tokensOfCollection, setTokensOfCollection] = useState<Array<string>>([]);
  const { api } = useApi();
  const { getTokensOfCollection } = useCollection(api);
  const currentAccount = useRef<string | null | undefined>();

  const openCollection = useCallback(() => {
    if (!opened) {
      void updateTokens();
    }
    setOpened(!opened);
  }, [account, opened, setTokensOfCollection]);

  const updateTokens = useCallback(async () => {
    if (!account) {
      return;
    }
    const tokensOfCollection = (await getTokensOfCollection(collection.id, account));
    setTokensOfCollection(tokensOfCollection);
  }, [account, collection, setTokensOfCollection]);

  // clear search results if account changed
  useEffect(() => {
    if (currentAccount.current && currentAccount.current !== account) {
      setOpened(false);
      setTokensOfCollection([]);
    }
    currentAccount.current = account;
  }, [account, currentAccount, setOpened, setTokensOfCollection]);

  useEffect(() => {
    if (shouldUpdateTokens && shouldUpdateTokens === collection.id) {
      void updateTokens();
      setShouldUpdateTokens(null);
    }
  }, [shouldUpdateTokens]);

  return (
    <ExpanderWithCallBack
      className='nft-collection-item'
      isOpen={opened}
      summary={
          <>
            <strong>{collection.name}</strong>
            {collection.prefix &&
            <span> ({collection.prefix})</span>
            }
            {collection.description &&
            <span> {collection.description}</span>
            }
          </>
        }
      toggleOpen={openCollection}
    >
      <table className='table'>
        <tbody>
        { tokensOfCollection.map(token => (
            <tr className='token-row' key={token}>
              <td className='token-image'>
                <a onClick={openDetailedInformationModal.bind(null, collection, token)}>
                  <Item.Image size='mini' src={tokenUrl(collection, token)} />
                </a>
              </td>
              <td className='token-name'>
                {collection.prefix} #{token.toString()}
              </td>
              <td className='token-actions'>
                <Button disabled={!canTransferTokens} onClick={openTransferModal.bind(null, collection.id, token)} primary>Transfer token</Button>
              </td>
            </tr>
        ))}
        </tbody>
      </table>
      <Button onClick={removeCollection.bind(null, collection.id)} basic color='red'>
        Remove collection
      </Button>
    </ExpanderWithCallBack>
  )
}

export default React.memo(NftCollectionCard);

