// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@polkadot/react-hooks';
import Input from '../Input';
import Spinner from '../Spinner';
import Available from './Available';
import Selected from './Selected';
import './styles.scss';
import arrowRight from './arrow-right.svg';
import arrowLeft from './arrow-left.svg';
import arrowRightBlue from './arrow-right-blue.svg';
import arrowLeftBlue from './arrow-left-blue.svg';

interface Props {
  available: string[];
  availableLabel: React.ReactNode;
  className?: string;
  defaultValue?: string[];
  help: React.ReactNode;
  maxCount: number;
  onChange: (values: string[]) => void;
  setManualStrategy?: (strategy: boolean) => void;
  value?: any;
  valueLabel: React.ReactNode;
}

function InputAddressMulti ({ available, availableLabel, className = '', defaultValue, maxCount, onChange, setManualStrategy, valueLabel }: Props): React.ReactElement<Props> {
  const [_filter, setFilter] = useState<string>('');
  const [selected, setSelected] = useState<string[]>(defaultValue || []);
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const [unSelectedValidators, setUnSelectedValidators] = useState<string[]>([]);
  const filter = useDebounce(_filter);
  const isLoading = false; // useLoadingDelay();

  const _onSelect = useCallback((address: string): void => {
    setUnSelectedValidators([]);
    setSelectedValidators((selectedItems: string[]) =>
      !selectedItems.includes(address) && (selectedItems.length < maxCount)
        ? selectedItems.concat(address)
        : selectedItems
    )
  }, [maxCount, selectedValidators]);

  const _onDeselect = useCallback((address: string): void => {
    setSelectedValidators([]);
    setUnSelectedValidators(
        (unSelectedItems: string[]) =>
          !unSelectedItems.includes(address)
            ? unSelectedItems.concat(address)
            : unSelectedItems
      );
  }, [unSelectedValidators]);

  const selectValidators = useCallback(() => {
    setManualStrategy && setManualStrategy(true);
    setSelected([...selectedValidators.reverse(), ...selected,]);
    setSelectedValidators([]);
  }, [selected, selectedValidators, setManualStrategy]);

  const deSelectValidators = useCallback(() => {
    setManualStrategy && setManualStrategy(true);
    setSelected(selected.filter(item => !unSelectedValidators.includes(item)));
    setUnSelectedValidators([]);
  }, [selected, setManualStrategy, unSelectedValidators]);

  /*useEffect((): void => {
    if (defaultValue
      && defaultValue.length
      && !defaultValue.filter(item => !selected.includes(item)).length) {
      selected && onChange(selected);
    }
  }, [onChange, selected]);

  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);*/

  useEffect((): void => {
    selected && onChange(selected);
  }, [onChange, selected]);

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
                isSelected={unSelectedValidators.includes(address)}
                key={address}
                onDeselect={_onDeselect}
              />
            ))}
          </div>
        </div>
        <div className='ui--InputAddressMulti-arrows-column'>
          { selectedValidators.length > 0 &&
          <img src={arrowRightBlue} onClick={selectValidators} className="selected" alt="arrow-right"/>
          || <img src={arrowRight} alt="arrow-right"/> }
          { unSelectedValidators.length > 0 &&
          <img src={arrowLeftBlue} onClick={deSelectValidators} className="selected" alt="arrow-left" />
          || <img src={arrowLeft} alt="arrow-left" /> }
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
                    isSelected={selectedValidators.includes(address)}
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
