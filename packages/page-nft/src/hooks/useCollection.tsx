// Copyright 2020 UseTech authors & contributors
import { useCallback } from 'react';

interface PolkadotApiInterface {
  query: any;
}

// @todo api.query.nft.collection(id)
function useCollection(api: PolkadotApiInterface | null) {
  const getTokensOfCollection = async (collectionId: number, ownerId: string) => {
    if (!api) {
      return;
    }
    return (await api.query.nft.addressTokens([collectionId, ownerId]));
  };

  const getDetailedCollectionInfo = useCallback(async (collectionId, ownerId) => {
    if (!api) {
      return;
    }
    return (await api.query.nft.collection(collectionId));
  }, []);

  const getDetailedTokenInfo = useCallback( async(collectionId: string, tokenId: string) => {
    if (!api) {
      return;
    }
    return (await api.query.nft.itemList([collectionId, tokenId]));
  }, [api]);

  return { getTokensOfCollection, getDetailedTokenInfo, getDetailedCollectionInfo };
}

export default useCollection;
