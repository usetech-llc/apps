// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Range } from 'react-range';
import { Icon, LabelHelp } from '@polkadot/react-components';
import linesSvg from './lines.svg';

interface Props {
  activeRange: Array<number>;
  setActiveRange: (activeRange: Array<number>) => void;
}

function RangeComponent (props: Props): React.ReactElement<Props> {
  const {
    activeRange,
    setActiveRange,
  } = props;

  return (
    <>
      <div className='range-block'>
        <div className='item left'>
          Conservative strategy
          <LabelHelp
            className='small-help'
            help='Conservative strategy'
          />
        </div>
        <div className='item center'>
          Balanced strategy
          <LabelHelp
            className='small-help'
            help='Balanced strategy'
          />
        </div>
        <div className='item right'>
          Aggressive strategy
          <LabelHelp
            className='small-help'
            help='Aggressive strategy'
          />
        </div>
        <Range
          step={0.1}
          min={0}
          max={10}
          values={activeRange}
          onChange={setActiveRange}
          renderTrack={({ props, children }) => (
            <div className='render-track'>
              <div
                className='render-track-inner'
                {...props}
                style={{
                  ...props.style,
                }}
              >
              {children}
              </div>
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              className='render-thumb'
              {...props}
              children={
                <>
                  <img src={linesSvg} />
                </>
              }
            />
          )}
        />
      </div>
      <span className='info-text-string'>
        <Icon icon='info-circle' />
        Now the 'Balanced strategy' is installed. If you change the candidates below, the strategy will become a 'Manual'
      </span>
    </>
  )
}

export default React.memo(RangeComponent);
