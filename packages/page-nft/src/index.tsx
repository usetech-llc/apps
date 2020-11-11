// Copyright 2020 UseTech authors & contributors

// global app props and types
import { AppProps as Props } from '@polkadot/react-components/types';

// external imports
import React, { useMemo } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom'

// local imports and components
import Tabs from '@polkadot/react-components/Tabs';
import NftWallet from './containers/NftWallet';
import MintTokens from './containers/MintTokens';
import BuyTokens from './containers/BuyTokens';
import './styles.scss';

function App ({ basePath, className }: Props): React.ReactElement<Props> {

  const items = useMemo(() => [
    {
      name: 'wallet',
      text: 'NFT Wallet'
    },
    {
      name: 'mintTokens',
      text: 'Mint Tokens'
    },
    {
      name: 'buyTokens',
      text: 'Buy Tokens'
    },
  ], []);

  return (
    <main className="nft--App">
      <header>
        <Tabs
          basePath={basePath}
          items={items}
        />
      </header>
      <Switch>
        <Route
          component={NftWallet}
          path={`${basePath}/wallet`}
        />
        <Route
          component={MintTokens}
          path={`${basePath}/mintTokens`}
        />
        <Route
          component={BuyTokens}
          path={`${basePath}/buyTokens`}
        />
        <Redirect to={`${basePath}/wallet`} />
      </Switch>
    </main>
  );
}

export default React.memo(App);
