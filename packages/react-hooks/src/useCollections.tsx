// Copyright 2020 UseTech authors & contributors
import { useCallback } from 'react';
import BN from 'bn.js';
import { useApi } from '@polkadot/react-hooks';

export type MetadataType = {
  metadata: string;
}

export interface NftCollectionInterface {
  Access: 'Normal'
  id: number;
  DecimalPoints: BN | number;
  Description: string;
  TokenPrefix: number | string;
  MintMode: boolean;
  Mode: {
    isNft: boolean;
    isFungible: boolean;
    isReFungible: boolean;
    isInvalid: boolean;
  };
  Name: string;
  OffchainSchema: string | MetadataType;
  SchemaVersion: 'ImageURL' | 'Unique';
  Sponsor: string; // account
  SponsorConfirmed: boolean;
  Limits: {
    AccountTokenOwnershipLimit: string;
    SponsoredMintSize: string;
    TokenLimit: string;
    SponsorTimeout: string;
  },
  VariableOnChainSchema: any;
  ConstOnChainSchema: any;
}

export function useCollections() {
  const { api } = useApi();

  const getTokensOfCollection = useCallback(async (collectionId: number, ownerId: string) => {
    if (!api) {
      return;
    }
    // @ts-ignore
    return (await api.query.nft.addressTokens(collectionId, ownerId));
  }, [api]);

  const getDetailedCollectionInfo = useCallback(async (collectionId) => {
    if (!api) {
      return;
    }
    try {
      // @ts-ignore
      return (await api.query.nft.collection(collectionId));
    } catch (e) {
      console.log('getDetailedCollectionInfo error', e);
      return;
    }
  }, []);

  const getDetailedTokenInfo = useCallback( async(collectionId: string, tokenId: string) => {
    if (!api) {
      return;
    }
    try {
      return (await api.query.nft.nftItemList(collectionId, tokenId));
    } catch (e) {
      console.log('getDetailedTokenInfo error', e);
      return;
    }
  }, [api]);

  const getDetailedReFungibleTokenInfo = useCallback(async (collectionId: string, tokenId: string) => {
    if (!api) {
      return;
    }
    // @ts-ignore
    return (await api.query.nft.reFungibleItemList(collectionId, tokenId));
  }, [api]);

  const presetTokensCollections = useCallback(async () => {
    if (!api) {
      return;
    }
    try {
      const collectionsCount = (await api.query.nft.collectionCount() as unknown as BN).toNumber();
      const collections: Array<NftCollectionInterface> = [];
      for (let i = 1; i <= collectionsCount; i++) {
        const collectionInf = await getDetailedCollectionInfo(i) as any;
        if (collectionInf && collectionInf.Owner && collectionInf.Owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM') {
          collections.push({ ...collectionInf, id: i });
        }
      }
      return collections;
    } catch (e) {
      console.log('preset tokens collections error', e);
      return [];
    }
  }, [api]);

  return {
    getTokensOfCollection,
    getDetailedTokenInfo,
    getDetailedCollectionInfo,
    getDetailedReFungibleTokenInfo,
    presetTokensCollections
  };
}
