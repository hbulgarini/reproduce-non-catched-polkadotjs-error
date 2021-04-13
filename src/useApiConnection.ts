// Copyright 2021 Parity Technologies (UK) Ltd.
// This file is part of Parity Bridges UI.
//
// Parity Bridges UI is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Parity Bridges UI is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Parity Bridges UI.  If not, see <http://www.gnu.org/licenses/>.

import { ApiPromise } from '@polkadot/api';
import { ApiOptions } from '@polkadot/api/types';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { TypeRegistry } from '@polkadot/types';
import React, { useEffect, useState } from 'react';


export interface ApiRxProviderProps {
  provider: ProviderInterface;
  types?: ApiOptions['types'];
}

export interface ApiPromiseConnectionType {
  api: ApiPromise; // From @polkadot/api\
  isApiReady: boolean;
}


export const ApiPromiseContext: React.Context<ApiPromiseConnectionType> = React.createContext(
  {} as ApiPromiseConnectionType
);

const registry = new TypeRegistry();

export function useApiConnection({ provider, types }: ApiRxProviderProps): ApiPromiseConnectionType {

  const [apiPromise, setApiPromise] = useState<ApiPromise>({} as ApiPromise);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    ApiPromise.create({ provider, types })
      .then((api): void => {
        console.log('connecting api');
        setApiPromise(api);
      })
      .catch((err): void => {

      });
  }, [ provider, types]);

  useEffect(() => {
    !isReady &&
      apiPromise &&
      apiPromise.isReady &&
      apiPromise.isReady
        .then(() => {
          if (types) {
            registry.register(types);
          }
          console.log('api  ready');
          setIsReady(true);
        })
        .catch((err): void => {
        });
  }, [apiPromise, isReady, types]);

  return { api: apiPromise, isApiReady: isReady };
}
