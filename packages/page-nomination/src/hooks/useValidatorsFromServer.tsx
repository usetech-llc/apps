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
}

/**
 * Get validators from server if health "connected":true
 * @return {Array<ValidatorInfo>} filtered validators from server
 */
function useValidatorsFromServer(): ValidatorsFromServerInterface {
  const [validators, setValidators] = useState<Array<ValidatorInfo> | []>([]);
  const [validatorsLoading, setValidatorsLoading] = useState<boolean>(true);
  const [nominationServerAvailable, setNominationServerAvailable] = useState<boolean>(false);

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

  const getValidatorsFromServer = useCallback((ksi) => {
    setValidatorsLoading(true);
    if (!nominationServerAvailable) {
      fetchData('/api/health').subscribe((result) => {
        if (result && result.connected) {
          setNominationServerAvailable(true);
          fetchData(`/api/bestvalidators?ksi=${ksi}`).subscribe((validators) => {
            setValidators(validators);
            setValidatorsLoading(false);
          });
        } else {
          setValidatorsLoading(false);
        }
      });
    } else {
      fetchData(`/api/bestvalidators?ksi=${ksi}`).subscribe((validators) => {
        setValidators(validators);
        setValidatorsLoading(false);
      });
    }
  }, [nominationServerAvailable, setValidators, setValidatorsLoading]);

  return { getValidatorsFromServer, nominationServerAvailable, validatorsFromServer: validators, validatorsFromServerLoading: validatorsLoading };
}

export default useValidatorsFromServer;
