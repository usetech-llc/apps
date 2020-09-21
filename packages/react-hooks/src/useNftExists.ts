// Copyright 2020 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {useCallback, useEffect, useState} from 'react';
import { useApi } from '@polkadot/react-hooks';

export default function useNftExists (): boolean {
  const { api } = useApi();
  const [nftExists, setNftExists] = useState<boolean>(false);

  const checkIfNftExists = useCallback(async () => {
    const nftExists = await api.query.nft;
    if (nftExists) {
      setNftExists(true);
    }
  }, [api.query.nft]);

  // check if nft exists - if not - hide it from menu
  useEffect(() => {
    void checkIfNftExists();
  }, [api.query.nft]);

  return nftExists;
}
