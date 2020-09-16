// Copyright 2017-2020 @polkadot/app-nomination authors & contributors
import { ValidatorInfo } from '../types';

import { useState, useCallback } from 'react';
import { of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, catchError } from 'rxjs/operators';

interface ValidatorsFromServerInterface {
  getValidatorsFromServer: (ksi: number) => void;
  nominationServerAvailable: boolean;
  validatorsFromServer: ValidatorInfo[];
  validatorsFromServerLoading: boolean;
  validatorsFromServerFailed: boolean;
}

/**
 * Get validators from server if health "connected":true
 * @return {Array<ValidatorInfo>} filtered validators from server
 */
function useValidatorsFromServer(): ValidatorsFromServerInterface {
  const [validators, setValidators] = useState<Array<ValidatorInfo> | []>([]);
  const [validatorsLoading, setValidatorsLoading] = useState<boolean>(true);
  const [nominationServerAvailable, setNominationServerAvailable] = useState<boolean>(true);
  const [validatorsFromServerFailed, setValidatorsFromServerFailed] = useState<boolean>(false);

  const fetchData = useCallback((url: string) => {
    const headers = {
      'accept': 'application/json',
    };
    return fromFetch(url, {
      method: 'GET',
      headers,
    }).pipe(
      switchMap((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return of({ error: true, message: `Error ${response.status}` });
        }
      }),
      catchError((err) => {
        setValidatorsLoading(false);
        setValidatorsFromServerFailed(true);
        return of({ error: true, message: err.message });
      })
    );
  }, []);

  const fetchValidators = useCallback((bestValidatorsUrl) => {
    fetchData(bestValidatorsUrl).subscribe((resp) => {
      if (resp.validators && resp.validators.length) {
        setValidators(resp.validators);
      } else {
        setValidatorsFromServerFailed(true);
      }
      setValidatorsLoading(false);
    });
  }, [fetchData]);

  const getValidatorsFromServer = useCallback((ksi) => {
    const bestValidatorsUrl = `/api/rpi/bestvalidators?ksi=${ksi}`;
    setValidatorsLoading(true);
    if (!nominationServerAvailable) {
      fetchData('/api/health').subscribe((result) => {
        if (result && result.connected) {
          setNominationServerAvailable(true);
          fetchValidators(bestValidatorsUrl);
        } else {
          setValidatorsFromServerFailed(true);
          setValidatorsLoading(false);
        }
      });
    } else {
      fetchValidators(bestValidatorsUrl);
    }
  }, [nominationServerAvailable, setValidators, setValidatorsLoading]);

  return {
    getValidatorsFromServer,
    nominationServerAvailable,
    validatorsFromServer: validators,
    validatorsFromServerLoading: validatorsLoading,
    validatorsFromServerFailed,
  };
}

export default useValidatorsFromServer;
