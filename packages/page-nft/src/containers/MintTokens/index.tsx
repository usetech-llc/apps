// Copyright 2020 UseTech authors & contributors

// global app props and types

// external imports
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';

// local imports and components
import './styles.scss';

interface MintTokensProps {
  className?: string;
}

function MintTokens ({ className }: MintTokensProps): React.ReactElement<MintTokensProps> {

  return (
    <main className="mint-tokens">
      Mint Tokens
    </main>
  );
}

export default React.memo(MintTokens);
