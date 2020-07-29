// Copyright 2020 UseTech authors & contributors
import { useState, useCallback, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import uiSettings from '@polkadot/ui-settings';

interface PolkadotApiInterface {
  query: any;
}

function useApi() {
  const [api, setApi] = useState<PolkadotApiInterface | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<any>(null);
  const settings = uiSettings.get();
  const connectToApi = useCallback( async() => {
    try {
      console.log('connectToApi', new Date().getTime());
      const wsProvider = new WsProvider(settings.apiUrl);
      // Create the API and wait until ready
      setApiLoading(true);
      const api = await ApiPromise.create({
        provider: wsProvider,
        types: {
          "Schedule": {
            "version": "u32",
            "put_code_per_byte_cost": "Gas",
            "grow_mem_cost": "Gas",
            "regular_op_cost": "Gas",
            "return_data_per_byte_cost": "Gas",
            "event_data_per_byte_cost": "Gas",
            "event_per_topic_cost": "Gas",
            "event_base_cost": "Gas",
            "call_base_cost": "Gas",
            "instantiate_base_cost": "Gas",
            "dispatch_base_cost": "Gas",
            "sandbox_data_read_cost": "Gas",
            "sandbox_data_write_cost": "Gas",
            "transfer_cost": "Gas",
            "instantiate_cost": "Gas",
            "max_event_topics": "u32",
            "max_stack_height": "u32",
            "max_memory_pages": "u32",
            "max_table_size": "u32",
            "enable_println": "bool",
            "max_subject_len": "u32"
          },
          "NftItemType": {
            "Collection": "u64",
            "Owner": "AccountId",
            "Data": "Vec<u8>"
          },
          "CollectionType": {
            "Owner": "AccountId",
            "NextItemId": "u64",
            "Name": "Vec<u16>",
            "Description": "Vec<u16>",
            "TokenPrefix": "Vec<u8>",
            "CustomDataSize": "u32",
            "Sponsor": "AccountId",
            "UnconfirmedSponsor": "AccountId"
          },
          "Address": "AccountId",
          "LookupSource": "AccountId",
          "Weight": "u64"
        }
      });

      if (api.isReady) {
        setApi(api);
      }
      setApiLoading(false);
    } catch (e) {
      console.log(' connection error', e);
      setApiLoading(false);
      setApiError(e);
    }
  }, []);

  useEffect(() => {
    void connectToApi();
  }, [connectToApi]);

  return { api, apiLoading, apiError };
}

export default useApi;
