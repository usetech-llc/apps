// Copyright 2017-2020 UseTech @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useCallback, useEffect, useState } from 'react';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface EmailSubscriptionInterface {
  isSubscribed: boolean;
  subscribe: (emailAddress: string) => void;
  subscriptionPending: boolean;
}

export default function useEmailSubscription (accountId: string | null): EmailSubscriptionInterface {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscriptionPending, setSubscriptionPending] = useState<boolean>(false);

  const fetchData = useCallback((url: string, params?: any) => {
    return fromFetch(url, params).pipe(
      switchMap((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return of({ error: true, message: `Error ${response.status}` });
        }
      }),
      catchError((err) => {
        setSubscriptionPending(false);

        return of({ error: true, message: err.message });
      })
    );
  }, []);

  const subscribe = useCallback((emailAddress: string) => {
    if (!accountId) {
      return;
    }

    fetchData(`/api/subscribe/${accountId}`, {
      body: JSON.stringify({ email: emailAddress }),
      method: 'POST'
    }).subscribe((result) => {
      if (result && result.status) {
        setIsSubscribed(true);
      } else {
        setSubscriptionPending(false);
      }
    });
  }, [accountId, fetchData]);

  useEffect(() => {
    if (!accountId) {
      return;
    }

    fetchData(`/api/subscriptionCheck/${accountId}`).subscribe((result) => {
      if (result && result.status) {
        setIsSubscribed(true);
      } else {
        setSubscriptionPending(false);
      }
    });
  }, [accountId, fetchData]);

  return {
    isSubscribed,
    subscribe,
    subscriptionPending
  };
}
