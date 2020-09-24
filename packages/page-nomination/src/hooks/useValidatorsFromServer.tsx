// Copyright 2017-2020 @polkadot/app-nomination authors & contributors
import { ValidatorInfo } from '../types';

import { useState, useCallback, useEffect } from 'react';
import { of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, catchError } from 'rxjs/operators';

interface ValidatorsFromServerInterface {
  nominationServerAvailable: boolean;
  validatorsFromServer: ValidatorInfo[];
  validatorsFromServerLoading: boolean;
}

/**
 * Get validators from server if health "connected":true
 * @return {Array<ValidatorInfo>} filtered validators from server
 */
function useValidatorsFromServer(ksi: number): ValidatorsFromServerInterface {
  const [validators, setValidators] = useState<Array<ValidatorInfo> | []>([]);
  const [validatorsLoading, setValidatorsLoading] = useState<boolean>(true);
  const [nominationServerAvailable, setNominationServerAvailable] = useState<boolean>(true);
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
        setNominationServerAvailable(false);
        return of({ error: true, message: err.message });
      })
    );
  }, []);

  useEffect(() => {
    const bestValidatorsUrl = `/api/rpi/bestvalidators?ksi=${(ksi / 10).toFixed(1)}`;
    const subscription = fetchData(bestValidatorsUrl).subscribe((resp) => {
      if (resp.validators && resp.validators.length) {
        setValidators(resp.validators);
      } else {
        setNominationServerAvailable(false);
      }
      setValidatorsLoading(false);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [ksi]);

  // check server health
  useEffect(() => {
    /*const subscription = fetchData('/api/health').subscribe((resp) => {
      if (resp && resp.connected) {
        setNominationServerAvailable(true);
      } else {
        setValidatorsFromServerFailed(true);
        setValidatorsLoading(false);
      }
    });
    return () => {
      subscription.unsubscribe();
    };*/
  }, []);

  return {
    nominationServerAvailable,
    validatorsFromServer: validators,
    validatorsFromServerLoading: validatorsLoading,
  };
}

export default useValidatorsFromServer;
