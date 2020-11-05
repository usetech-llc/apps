// Copyright 2020 @polkadot/app-nft authors & contributors
import { ImageInterface } from '../types';

import { useState, useEffect, useCallback } from 'react';
import { of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, catchError } from 'rxjs/operators';

interface UseMintApiInterface {
  imgLoading: boolean;
  serverIsReady: boolean;
  uploadImage: (image: ImageInterface) => void;
  uploadedSuccessfully: boolean;
}

/**
 * Get validators from server if health "connected":true
 * @return {Array<ValidatorInfo>} filtered validators from server
 */
function useMintApi (): UseMintApiInterface {
  const [imgLoading, setImgLoading] = useState<boolean>(false);
  const [serverIsReady, setServerIsReady] = useState<boolean>(false);
  const [uploadedSuccessfully, setUploadedSuccessfully] = useState<boolean>(false);

  const fetchData = useCallback((url: string) => {
    return fromFetch(url).pipe(
      switchMap((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return of({ error: true, message: `Error ${response.status}` });
        }
      }),
      catchError((err) => {
        setServerIsReady(false);

        return of({ error: true, message: err.message });
      })
    );
  }, []);

  const uploadImage = useCallback(async (file: ImageInterface) => {
    setImgLoading(true);
    try {
      const response = await fetch('/mint', { // Your POST endpoint
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(file)
      });
      console.log('response', response);
      setUploadedSuccessfully(true);
      setImgLoading(false);
    } catch (e) {
      console.log('error uploading image', e);
      setImgLoading(false)
    }
  }, []);

  useEffect(() => {
    fetchData('/health').subscribe((result) => {
      if (result && result.connected) {
        setServerIsReady(true);
      } else {
        setServerIsReady(false);
      }
    });
  }, [fetchData, setServerIsReady]);

  return { imgLoading, serverIsReady, uploadImage, uploadedSuccessfully };
}

export default useMintApi;
