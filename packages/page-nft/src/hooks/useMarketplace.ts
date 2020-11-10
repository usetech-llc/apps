// Copyright 2020 @polkadot/app-nft authors & contributors

import { PunkForSaleInterface } from '../types';
import { url, path } from '../contants';

import { useCallback, useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import useAccounts from './useAccounts';

interface MarketPlaceInterface {
  errorWhileFetchingPunks: boolean;
  punksForSale: Array<PunkForSaleInterface>;
}

interface PunkFromServerInterface {
  address: string;
  price: string;
}

const useMarketplace = (): MarketPlaceInterface => {
  const [punksForSale, setPunksForSale] = useState<Array<PunkForSaleInterface>>([]);
  const [errorWhileFetchingPunks, setErrorWhileFetchingPunks] = useState<boolean>(false);
  const { fetchData } = useFetch();
  const { allAccounts } = useAccounts();

  console.log('punksForSale', punksForSale);

  const getTokensFromMarketplace = useCallback(() => {
    fetchData(`${url}${path}`).subscribe((result) => {
      console.log('result', result);
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

  useEffect(() => {
    getTokensFromMarketplace();
  }, []);

  return { errorWhileFetchingPunks, punksForSale }
};

export default useMarketplace;
