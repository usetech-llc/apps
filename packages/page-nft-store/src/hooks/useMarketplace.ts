// Copyright 2020 @polkadot/app-nft authors & contributors

import { PunkForSaleInterface, Punk } from '../types';
import { url, path, attributes, punkCollectionId, punksContractAddress, vaultAddress, marketContractAddress } from '../constants';

import { useCallback, useEffect, useState } from 'react';
import { useFetch, useAccounts, useApi, useTransfer } from '@polkadot/react-hooks';
import { MessageInterface } from '@polkadot/react-hooks/useTransfer';
import { Abi, ContractPromise } from '@polkadot/api-contract';
import marketContractAbi from '../market_metadata.json';

interface MarketPlaceInterface {
  errorWhileFetchingPunks: boolean;
  punksForSale: Array<PunkForSaleInterface>;
  loadPunkFromChain: (punkId: string, collectionId?: string, contractAddress?: string) => Promise<Punk>;
}

interface PunkFromServerInterface {
  address: string;
  price: string;
}

const useMarketplace = (account: string | null): MarketPlaceInterface => {
  const [punksForSale, setPunksForSale] = useState<Array<PunkForSaleInterface>>([]);
  const [errorWhileFetchingPunks, setErrorWhileFetchingPunks] = useState<boolean>(false);
  const [transactionStatus, setTransactionStatus] = useState<MessageInterface>();
  const [abi, setAbi] = useState();
  const { fetchData } = useFetch();
  const { allAccounts } = useAccounts();
  const { api } = useApi();
  const { transferToken } = useTransfer(account);

  const getDepositor = useCallback(async (punkId, readerAddress) => {
    const keyring = new Keyring({ type: 'sr25519' });
    const result = await this.contractInstance.call('rpc', 'get_nft_deposit', value, maxgas, collectionId, punkId).send(readerAddress);
    if (result.output) {
      const address = keyring.encodeAddress(result.output.toString());
      console.log("Deposit address: ", address);
      return address;
    }
    return null;
  }, [])

  // deposit token to vaultAddress
  const depositTransaction = useCallback(async (account, address = vaultAddress, collectionId = punkCollectionId, tokenId) => {
    await transferToken(collectionId, tokenId, address, setTransactionStatus);
  }, []);

  const getTokensFromMarketplace = useCallback(() => {
    fetchData(`${url}${path}`).subscribe((result) => {
      if (!result || result.error) {
        setErrorWhileFetchingPunks(true)
      } else {
        const punks = Object.keys(result)
          .map((punkKey: string): PunkForSaleInterface  => ({
            id: punkKey.substring(punkKey.indexOf('-') + 1),
            isOwned: true,
            my: allAccounts.includes((result[punkKey] as PunkFromServerInterface).address),
            price: (result[punkKey] as PunkFromServerInterface).price
          }));
        setPunksForSale(punks);
      }
    });
  }, []);

  const loadPunkFromChain = useCallback(async (punkId, collectionId = punkCollectionId, contractAddress = punksContractAddress) => {
    console.log(`Loading punk ${punkId} from collection ${punkCollectionId}`);

    const item = await api.query.nft.nftItemList(punkCollectionId, punkId) as unknown as { Data: any, Owner: any };
    console.log("Received item: ", item);

    let attrArray = [];
    for (let i = 0; i < 7; i++) {
      if (item.Data[i + 3] != 255)
        attrArray.push(attributes[item.Data[i+3]]);
    }

    return {
      originalId : item.Data[0] + item.Data[1] * 256,
      owner: item.Owner.toString(),
      sex: (item.Data[2] == 1) ? "Female" : "Male",
      attributes: attrArray,
      isOwned: contractAddress === item.Owner
    } as Punk;
  }, []);

  useEffect(() => {
    getTokensFromMarketplace();
  }, []);

  useEffect(() => {
    const contractInstance = new ContractPromise(api, abi, marketContractAddress);
  }, []);

  useEffect(() => {
    const abi = new Abi(api.registry, marketContractAbi);
  }, []);

  return { errorWhileFetchingPunks, punksForSale, loadPunkFromChain }
};

export default useMarketplace;
