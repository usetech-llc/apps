// Copyright 2017-2021 @polkadot/react-hooks, useTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState, useCallback } from 'react';
import BN from 'bn.js';
import { useCollections, NftCollectionInterface, MetadataType } from '@polkadot/react-hooks';
import useDecoder from './useDecoder';

/*
    {
        [
            {"Trait 1":
                {
                    "type": "enum",
                    "size": 1,
                    "values": ["Black Lipstick","Red Lipstick","Smile","Teeth Smile","Purple Lipstick","Nose Ring","Asian Eyes","Sun Glasses","Red Glasses","Round Eyes","Left Earring","Right Earring","Two Earrings","Brown Beard","Mustache-Beard","Mustache","Regular Beard","Up Hair","Down Hair","Mahawk","Red Mahawk","Orange Hair","Bubble Hair","Emo Hair","Thin Hair","Bald","Blonde Hair","Caret Hair","Pony Tails","Cigar","Pipe"]
                }
            }
        ]
    }
*/

export type TokenAttribute = {
  [key: string]: {
    type: number | string | 'enum';
    size: number;
    values: string[];
  }
}

export type Attributes = TokenAttribute[];


export default function useSchema (collectionId: string | number, tokenId: string | number) {
  const [collectionInfo, setCollectionInfo] = useState<NftCollectionInterface>();
  const [tokenUrl, setTokenUrl] = useState<string>('');
  const [attributes, setAttributes] = useState<any>();
  const { getDetailedCollectionInfo, getDetailedTokenInfo, getDetailedReFungibleTokenInfo } = useCollections();
  const { collectionName8Decoder } = useDecoder();

  const tokenImageUrl = useCallback((tokenId: string, urlString: string): string => {
    if (urlString.indexOf('{id}') !== -1) {
      return urlString.replace('{id}', tokenId)
    }
    return '';
  },  []);

  const convertOnChainMetadata = useCallback((data: string) => {
    console.log('data', data);
    try {
      if (data && data.length) {
        const jsonData = JSON.parse(data);
        console.log('jsonData', jsonData);
        return jsonData;
      } else {
        return {};
      }
    } catch (e) {
      console.log('schema json parse error', e);
    }
    /*return data.map((dataItem) => {
      return Object.keys(dataItem).map((dataItemKey: string) => {
        if (dataItem[dataItemKey].type === 'enum') {
          return dataItem[dataItemKey].values[dataItem[dataItemKey].size];
        }
        return null;
      })
    })*/
  }, []);

  const setSchema = useCallback(async () => {

    if (collectionInfo) {
      switch (collectionInfo.SchemaVersion) {
        case 'ImageURL':
          setTokenUrl(tokenImageUrl(collectionInfo.OffchainSchema as string, tokenId.toString()));
          break;
        case 'Unique':
          const dataUrl = tokenImageUrl((collectionInfo.OffchainSchema as MetadataType).metadata, tokenId.toString());
          const urlResponse = await fetch(dataUrl);
          const jsonData = await urlResponse.json() as { image: string };
          setTokenUrl(jsonData.image);
          break;
        default:
          break;
      }
      setAttributes({
        ...convertOnChainMetadata(collectionInfo.ConstOnChainSchema),
        ...convertOnChainMetadata(collectionInfo.VariableOnChainSchema)
      });
    }
  }, [collectionInfo]);

  const getCollectionInfo = useCallback(async () => {
    if (collectionId) {
      const info: NftCollectionInterface = await getDetailedCollectionInfo(collectionId) as unknown as NftCollectionInterface;
      setCollectionInfo({
        ...info,
        ConstOnChainSchema: collectionName8Decoder(info.ConstOnChainSchema),
        VariableOnChainSchema: collectionName8Decoder(info.VariableOnChainSchema),
      });
    }
  }, []);

  const getTokenDetails = useCallback(async () => {
    console.log('getTokenDetails', 'collectionId', collectionId, 'tokenId', tokenId, 'collectionInfo', collectionInfo)
    if (collectionId && tokenId && collectionInfo) {
      let tokenDetails = {};
      if (collectionInfo.Mode.isNft) {
        tokenDetails = (await getDetailedTokenInfo(collectionId.toString(), tokenId.toString())) as any;
      } else if (collectionInfo.Mode.isReFungible) {
        tokenDetails = (await getDetailedReFungibleTokenInfo(collectionId.toString(), tokenId.toString())) as any;
      }
      console.log('tokenDetails', tokenDetails);
    }
  }, [collectionId, collectionInfo, getDetailedTokenInfo, getDetailedReFungibleTokenInfo, tokenId]);

  console.log('attributes', attributes);

  useEffect(() => {
    if (collectionInfo) {
      void setSchema();
      void getTokenDetails();
    }
  }, [collectionInfo, getTokenDetails, setSchema]);

  useEffect(() => {
    void getCollectionInfo();
  }, [getCollectionInfo]);

  return { attributes, collectionInfo, tokenUrl };
}
