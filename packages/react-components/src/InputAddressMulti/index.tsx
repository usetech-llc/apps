// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useEffect, useState } from 'react';
import { useDebounce, useLoadingDelay } from '@polkadot/react-hooks';

import { useTranslation } from '../translate';
import Input from '../Input';
import Spinner from '../Spinner';
import Available from './Available';
import Selected from './Selected';
import './styles.scss';

interface Props {
  available: string[];
  availableLabel: React.ReactNode;
  className?: string;
  defaultValue: string[];
  help: React.ReactNode;
  maxCount: number;
  onChange: (values: string[]) => void;
  valueLabel: React.ReactNode;
}

function InputAddressMulti ({ available, availableLabel, className = '', defaultValue, maxCount, onChange, valueLabel }: Props): React.ReactElement<Props> {
  const [_filter, setFilter] = useState<string>('');
  const [selected, setSelected] = useState<string[]>(defaultValue);
  const filter = useDebounce(_filter);
  const isLoading = false; // useLoadingDelay();

  useEffect((): void => {
    selected && onChange(selected);
  }, [onChange, selected]);

  const _onSelect = useCallback((address: string): void => {
    setSelected(
        (selected: string[]) =>
          !selected.includes(address) && (selected.length < maxCount)
            ? selected.concat(address)
            : selected
      );
  }, [maxCount]);

  const _onDeselect = useCallback((address: string): void => {
    setSelected(
        (selected: string[]) =>
          selected.includes(address)
            ? selected.filter((a) => a !== address)
            : selected
      );
  }, []);

  return (
    <div className={`ui--InputAddressMulti ${className}`}>
      <Input
        autoFocus
        className='ui--InputAddressMulti-Input'
        isSmall
        onChange={setFilter}
        placeholder={'filter by name, address, or account index'}
        value={_filter}
        withLabel={false}
      />
      <div className='ui--InputAddressMulti-columns'>
        <div className='ui--InputAddressMulti-column'>
          <label>{valueLabel}</label>
          <div className='ui--InputAddressMulti-items'>
            {selected.map((address): React.ReactNode => (
              <Selected
                address={address}
                key={address}
                onDeselect={_onDeselect}
              />
            ))}
          </div>
        </div>
        <div className='ui--InputAddressMulti-column'>
          <label>{availableLabel}</label>
          <div className='ui--InputAddressMulti-items'>
            {isLoading
              ? <Spinner />
              : (
                available.map((address) => (
                  <Available
                    address={address}
                    filter={filter}
                    isHidden={selected ? selected.includes(address) : false}
                    key={address}
                    onSelect={_onSelect}
                  />
                ))
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(InputAddressMulti);
