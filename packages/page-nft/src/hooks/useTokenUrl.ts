import { useCallback, useEffect, useState } from 'react';

const useTokenUrl = (collection: string, tokenId: string): string | undefined => {
  const [tokenUrl, setTokenUrl] = useState<string>();

  const defineTokenUrl = useCallback((collection, tokenId: string): string => {
    if (collection.offchainSchema.indexOf('image{id}.pn') !== -1) {
      setTokenUrl(collection.offchainSchema.replace('image{id}.pn', `image${tokenId}.png`))
    }
    if (collection.offchainSchema.indexOf('image{id}.jp') !== -1) {
      setTokenUrl(collection.offchainSchema.replace('image{id}.jp', `image${tokenId}.jpg`))
    }
    if (collection.offchainSchema.indexOf('image/{id}.jp') !== -1) {
      setTokenUrl(collection.offchainSchema.replace('{id}.jp', `${tokenId}.jpg`))
    }
    if (collection.offchainSchema.indexOf('image/{id}.pn') !== -1) {
      setTokenUrl(collection.offchainSchema.replace('{id}.pn', `${tokenId}.png`))
    }
    if (collection.offchainSchema.indexOf('images/{id') !== -1) {
      setTokenUrl(collection.offchainSchema.replace('{id', `${tokenId.toString()}`))
    }
    return '';
  },  []);

  useEffect(() => {
    defineTokenUrl(collection, tokenId);
  }, [collection, tokenId]);

  return tokenUrl;
};
export default useTokenUrl;
