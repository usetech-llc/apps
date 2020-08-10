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
  const getTokensOfCollection = async (collectionId: number, ownerId: string) => {
    if (!api) {
      return;
    }
    return (await api.query.nft.addressTokens(collectionId, ownerId));
  };

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
    // ReFungibleItemList for re-fungible
    /*
      "ReFungibleItemType": {
        "Collection": "u64",
        "Owner": "Vec<Ownership<AccountId>>",
        "Data": "Vec<u8>"
      },

      "Ownership": {
          "owner": "AccountId",
          "fraction": "u128"
       },
     */
    return (await api.query.nft.itemList([collectionId, tokenId]));
  }, [api]);

  // hardcode
 /* const getCollectionImagesUrl = useCallback( async (collectionId: string) => {
    if (!api) {
      return
    }
    // return 'http://ipfs-gateway.usetech.com/ipfs/QmUPArQGiDXyLFcxfU3LrctNQNPnD9QP62k2eNJkZgdRPJ/images/punks';
    return (await api.query.nft.offchainSchema([collectionId]));
  }, []); */

  return { getTokensOfCollection, getDetailedTokenInfo, getDetailedCollectionInfo };
}

export default useCollection;
