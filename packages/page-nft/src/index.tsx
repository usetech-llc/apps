// Copyright 2020 UseTech authors & contributors

// global app props and types
import { AppProps as Props } from '@polkadot/react-components/types';

// external imports
import React from 'react';

// local imports and components
import NftWallet from './containers/NftWallet';
import './styles.scss';

function App ({ basePath, className }: Props): React.ReactElement<Props> {

  return (
    <main className="nft--App">
      <NftWallet />
    </main>
  );
}

export default React.memo(App);
