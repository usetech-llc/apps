// Copyright 2017-2020 @polkadot/app-nomination authors & contributors
import { ValidatorInfo } from './types';

import { useState, useEffect, useCallback } from 'react';
import { of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, catchError } from 'rxjs/operators';

interface ValidatorsFromServerInterface {
  validatorsFromServer: ValidatorInfo[];
  validatorsFromServerLoading: boolean;
}

/**
 * Get validators from server if health "connected":true
 * @return {Array<ValidatorInfo>} filtered validators from server
 */
function useValidatorsFromServer (): ValidatorsFromServerInterface {
  const [validators, setValidators] = useState<Array<ValidatorInfo> | []>([]);
  const [validatorsLoading, setValidatorsLoading] = useState<boolean>(true);

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
        setValidatorsLoading(false);

        return of({ error: true, message: err.message });
      })
    );
  }, []);

  useEffect(() => {
    fetchData('/api/health').subscribe((result) => {
      if (result && result.connected) {
        fetchData('/api/bestvalidators').subscribe((validators) => {
          setValidators(validators);
          setValidatorsLoading(false);
        });
      } else {
        setValidatorsLoading(false);
      }
    });
  }, [fetchData]);

  return { validatorsFromServer: validators, validatorsFromServerLoading: validatorsLoading };
}

export default useValidatorsFromServer;
