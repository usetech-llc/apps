// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback } from 'react';
import { Range } from 'react-range';
import { Icon, LabelHelp } from '@polkadot/react-components';

interface Props {
  activeRange: Array<number>;
  setActiveRange: (activeRange: Array<number>) => void;
}

function RangeComponent (props: Props): React.ReactElement<Props> {
  const {
    activeRange,
    setActiveRange,
  } = props;

  // https://gist.github.com/mlocati/7210513
  const percent2color = useCallback((perc: number) => {
    let r, g, b = 0;
    if(perc < 50) {
      r = 245;
      g = Math.round(4.8 * perc);
    }
    else {
      g = 222;
      r = Math.round(480 - 4.8 * perc);
    }
    const h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
  }, []);

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
            <div className='render-track'
              style={{
                background: `linear-gradient(270deg, #EF4040 0%, rgba(245, 222, 0, 0.994583) 54.17%, rgba(109, 239, 64, 0.99) 100%)`
              }}
            >
              <div
                className='render-track-inner'
                {...props}
              >
              {children}
              </div>
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              className='render-thumb'
              {...props}
              style={{
                ...props.style,
                border: `4px solid ${percent2color((10 - activeRange[0]) * 10)}`,
              }}
              children={
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill={`${percent2color((10 - activeRange[0]) * 10)}`} fillRule="evenodd" clipRule="evenodd" d="M0 8L3.54063e-07 0H1.6L1.6 8H0ZM3.19999 8L3.19999 0H4.79999L4.79999 8H3.19999ZM6.39997 0L6.39997 8H7.99997L7.99997 0H6.39997Z" />
                </svg>
              }
            />
          )}
        />
      </div>
    </>
  )
}

export default React.memo(RangeComponent);
