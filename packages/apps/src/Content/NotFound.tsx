// Copyright 2017-2020 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Redirect } from 'react-router';
import { useNftExists } from '@polkadot/react-hooks/index';

function NotFound (): React.ReactElement {
  const nftExists = useNftExists();

  if (nftExists) {
    return (
      <Redirect to='/nft' />
    );
  }

  return (
    <Redirect to='/explorer' />
  );
}

export default React.memo(NotFound);
