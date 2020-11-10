// Copyright 2020 UseTech authors & contributors

// global app props and types

// external imports
import React, { ReactElement } from 'react';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

// local imports and components


interface BuyTokensProps {
  className?: string;
}

const BuyTokens = ({ className }: BuyTokensProps): ReactElement<BuyTokensProps> => {
  return (
    <div className='buy-tokens'>
      <Header as='h1'>Buy Tokens</Header>
    </div>
  )
};

export default BuyTokens;
