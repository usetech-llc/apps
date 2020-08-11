// Copyright 2020 UseTech authors & contributors
import { useCallback } from 'react';

interface PolkadotApiInterface {
  query: any;
}

export interface NftCollectionInterface {
  id: number;
  decimalPoints: number;
  description: string;
  isReFungible: boolean;
  name: string;
  offchainSchema: string;
  prefix: string;
}

// @todo api.query.nft.collection(id)
function useCollection(api: PolkadotApiInterface | null) {

  const getTokensOfCollection = useCallback(async (collectionId: number, ownerId: string) => {
    if (!api) {
      return;
    }
    return (await api.query.nft.addressTokens(collectionId, ownerId));
  }, [api]);

  const getDetailedCollectionInfo = useCallback(async (collectionId) => {
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

  const getDetailedRefungibleTokenInfo = useCallback(async (collectionId: number, tokenId: string) => {
    if (!api) {
      return;
    }
    return (await api.query.nft.reFungibleItemList(collectionId, tokenId));
  }, [api]);

  return { getTokensOfCollection, getDetailedTokenInfo, getDetailedCollectionInfo, getDetailedRefungibleTokenInfo };
}

export default useCollection;
