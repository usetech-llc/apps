// Copyright 2020 UseTech authors & contributors

// global app props and types
import { AppProps as Props } from '@polkadot/react-components/types';

// external imports
import React, {useMemo, useState} from 'react';
import { Redirect, Route, Switch } from 'react-router-dom'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

// local imports and components
import Tabs from '@polkadot/react-components/Tabs';
import NftWallet from './containers/NftWallet';
import MintTokens from './containers/MintTokens';
import BuyTokens from './containers/BuyTokens';
import AccountSelector from './components/AccountSelector';
import FormatBalance from './components/FormatBalance';
import useBalance from './hooks/useBalance';
import './styles.scss';

function App ({ basePath, className }: Props): React.ReactElement<Props> {
  const [account, setAccount] = useState<string | null>(null);
  const { balance } = useBalance(account);

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
      <Header as='h1'>Usetech NFT wallet</Header>
      <Grid className='account-selector'>
        <Grid.Row>
          <Grid.Column width={12}>
            <AccountSelector onChange={setAccount} />
          </Grid.Column>
          <Grid.Column width={4}>
            { balance && (
              <div className='balance-block'>
                <label>Your account balance is:</label>
                <FormatBalance value={balance.free} className='balance' />
              </div>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <header>
        <Tabs
          basePath={basePath}
          items={items}
        />
      </header>
      <Switch>
        <Route
          path={`${basePath}/wallet`}
        >
          <NftWallet account={account} />
        </Route>
        <Route
          path={`${basePath}/mintTokens`}
        >
          <MintTokens account={account} />
        </Route>
        <Route
          path={`${basePath}/buyTokens`}
        >
          <BuyTokens account={account} />
        </Route>
        <Redirect to={`${basePath}/wallet`} />
      </Switch>
    </main>
  );
}

export default React.memo(App);
