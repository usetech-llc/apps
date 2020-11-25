// Copyright 2020 @polkadot/app-nft authors & contributors

import { useEffect, useState } from 'react';

// 0 == user owns token, no offers placed
// 1 == user pressed Trade button
// 2 == token sent to vault, waiting for deposit (ownership cannot be determined)
// 3 == deposit ready, user can place ask
// 4 == Ask placed, user can cancel
// 5 == Someone else owns token, no offers placed
// 6 == Token is for sale, can buy
// 7 == User pressed buy button, should deposit KSM
// 8 == User deposited KSM, waiting to register
// 9 == KSM deposited, Can sign buy transaction

type SaleStage = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';

interface SaleOrByStagesInterface {
  saleStage: SaleStage
}

const useSaleOrBuyStages = (): SaleOrByStagesInterface => {
  const [saleStage, setSaleStage] = useState<SaleStage>('0');

  useEffect(() => {
  }, []);

  return { saleStage }
};

export default useSaleOrBuyStages;
