// Copyright 2020 @polkadot/app-nft authors & contributors

import { PunkForSaleInterface, Punk } from '../types';
import { url, path, attributes, punkCollectionId, punksContractAddress, marketContractAddress } from '../constants';

import { useCallback, useEffect, useState } from 'react';
import { useFetch, useAccounts, useApi } from '@polkadot/react-hooks';
// import { MessageInterface } from '@polkadot/react-hooks/useTransfer';
import keyring from '@polkadot/ui-keyring';
import { Abi, ContractPromise } from '@polkadot/api-contract';
import marketContractAbi from '../market_metadata.json';

interface MarketPlaceInterface {
  errorWhileFetchingPunks: boolean;
  getDepositor: (punkId: number, readerAddress: string, collectionId: string) => Promise<string | null>;
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
  // const [transactionStatus, setTransactionStatus] = useState<MessageInterface>();
  // @ts-ignore
  const [[abi, contractAbi, isAbiSupplied, isAbiValid, abiName], setAbi] = useState<[string | null | undefined, Abi | null | undefined, boolean, boolean, string | null]>([null, null, false, false, null]);
  const [contractInstance, setContractInstance] = useState();
  const { fetchData } = useFetch();
  const { allAccounts } = useAccounts();
  const { api } = useApi();
  const value = 0;
  const maxgas = 1000000000000;
  // const { transferToken } = useTransfer(account);

  const getDepositor = useCallback(async (punkId, readerAddress, collectionId = punkCollectionId) => {
    const result = await contractInstance.call('rpc', 'get_nft_deposit', value, maxgas, collectionId, punkId).send(readerAddress);
    if (result.output) {
      const address = keyring.encodeAddress(result.output.toString());
      console.log("Deposit address: ", address);
      return address;
    }
    return null;
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
    setContractInstance(new ContractPromise(api, abi, marketContractAddress));
  }, [abi]);

  useEffect(() => {
    // setAbi(new Abi(api.registry, marketContractAbi));
    try {
      setAbi([JSON.stringify(marketContractAbi), new Abi(JSON.stringify(marketContractAbi), api.registry.getChainProperties()), true, true, 'nftContract']);
    } catch (e) {
      console.log('set abi error', e);
    }
  }, []);

  return { errorWhileFetchingPunks, getDepositor, punksForSale, loadPunkFromChain }
};

export default useMarketplace;
