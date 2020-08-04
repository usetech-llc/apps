// Copyright 2020 UseTech authors & contributors
import React from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Item from 'semantic-ui-react/dist/commonjs/views/Item';

import './NftTokenCard.scss';
import favicon from '../../images/favicon.png';

interface Props {
  canTransferTokens: boolean;
  collectionPrefix: string;
  openTransferModal: (tokenId: string) => void;
  openDetailedInformationModal: (tokenId: string) => void;
  tokenId: string;
}

function NftTokenCard({ canTransferTokens, collectionPrefix, openTransferModal, openDetailedInformationModal, tokenId }: Props): React.ReactElement<Props> {
  return (
    <Item className='nft-token-card'>
      <Item.Image size='mini' src={favicon} />
      <Item.Content verticalAlign='middle'>
        <Item.Header as='a'>{collectionPrefix} #{tokenId.toString()}</Item.Header>
        <Item.Extra>
          <Button onClick={openDetailedInformationModal.bind(null, tokenId)}>Show detail information</Button>
          <Button disabled={!canTransferTokens} onClick={openTransferModal.bind(null, tokenId)} primary>Transfer token</Button>
        </Item.Extra>
      </Item.Content>
    </Item>
  )
}

export default React.memo(NftTokenCard);
