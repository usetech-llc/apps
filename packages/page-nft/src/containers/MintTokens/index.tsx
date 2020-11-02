// Copyright 2020 UseTech authors & contributors

// global app props and types

// external imports
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { Button, Icon, Input} from '@polkadot/react-components';
// import { default as SeInput } from 'semantic-ui-react/dist/commonjs/Elements/Input';
import FileInput from '@brainhubeu/react-file-input';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

// local imports and components

import './styles.scss';

interface MintTokensProps {
  className?: string;
}

function MintTokens ({ className }: MintTokensProps): React.ReactElement<MintTokensProps> {

  const onChangeString = useCallback(() => {

  }, []);

  const onFileUpload = useCallback(() => {

  }, []);

  // @ts-ignore
  return (
    <main className="mint-tokens">
      <Header as='h1'>Mint Tokens</Header>
      <Form className='collection-search'>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <Form.Field>
                <Input
                  className='explorer--query label-small'
                  label={<span>Enter your token name</span>}
                  onChange={onChangeString}
                  // value={searchString}
                  placeholder='Token Name'
                  withLabel
                />
              </Form.Field>
              <Form.Field>
                <FileInput
                  label='Awesome Uploader'
                  onChangeCallback={onFileUpload}
                />
              </Form.Field>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </main>
  );
}

export default React.memo(MintTokens);
