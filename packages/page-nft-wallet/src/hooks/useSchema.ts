// Copyright 2017-2021 @polkadot/react-hooks, useTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState, useCallback } from 'react';
import { useCollections, NftCollectionInterface, MetadataType } from '@polkadot/react-hooks';

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
  const { getDetailedCollectionInfo } = useCollections();

  const tokenImageUrl = useCallback((tokenId: string, urlString: string): string => {
    if (urlString.indexOf('{id}') !== -1) {
      return urlString.replace('{id}', tokenId)
    }
    return '';
  },  []);

  const convertOnChainMetadata = useCallback((data: Attributes) => {
    return data.map((dataItem) => {
      return Object.keys(dataItem).map((dataItemKey: string) => {
        if (dataItem[dataItemKey].type === 'enum') {
          return dataItem[dataItemKey].values[dataItem[dataItemKey].size];
        }
        return null;
      })
    })
  }, []);

  const setSchema = useCallback((collectionInfo: NftCollectionInterface) => {
    // collectionInfo.VariableOnChainSchema
    // collectionInfo.ConstOnChainSchema
    // collectionInfo.OffchainSchema
    switch (collectionInfo.SchemaVersion) {
      case 'ImageURL':
        setTokenUrl(tokenImageUrl(collectionInfo.OffchainSchema as string, tokenId.toString()));
        break;
      case 'Unique':
        setTokenUrl(tokenImageUrl((collectionInfo.OffchainSchema as MetadataType).metadata, tokenId.toString()));
        setAttributes(convertOnChainMetadata(collectionInfo.ConstOnChainSchema || collectionInfo.VariableOnChainSchema));
        break;
      default:
        break;
    }
  }, []);

  const getCollectionInfo = useCallback(async () => {
    if (collectionId) {
      const info: NftCollectionInterface = await getDetailedCollectionInfo(collectionId) as unknown as NftCollectionInterface;
      console.log('info', info);
      setCollectionInfo(info);
      setSchema(info);
    }
  }, []);

  useEffect(() => {
    void getCollectionInfo();
  }, [getCollectionInfo]);

  return { attributes, collectionInfo, tokenUrl };
}
