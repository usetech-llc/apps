// Copyright 2020 UseTech authors & contributors
import React, {useCallback} from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';
import Card from 'semantic-ui-react/dist/commonjs/views/Card';

import { NftCollectionInterface } from '../../hooks/useCollection';
import './NftCollectionCard.scss';

interface Props {
  collection: NftCollectionInterface;
  currentCollectionId: string | null;
  removeCollection: (collection: string) => void;
  selectCollection: (collectionId: string) => void;
}

function NftCollectionCard({ collection, currentCollectionId, selectCollection, removeCollection }: Props): React.ReactElement<Props> {

  const selectCollectionId = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    selectCollection(collection.id);
  }, []);

  return (
    <a href='/' onClick={selectCollectionId} className={`nft-collection-item ${currentCollectionId === collection.id ? 'active' : ''}`}>
      <Card className='nft-collection-card'>
        <Card.Content>
          <Card.Description>
            <h3>{collection.name}
            {collection.prefix &&
              <span>({collection.prefix})</span>
            }
            </h3>
            <p>{collection.description}</p>
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Button onClick={removeCollection.bind(null, collection.id)} basic color='red'>
            Remove collection
          </Button>
        </Card.Content>
      </Card>
    </a>
  )
}

export default React.memo(NftCollectionCard);

