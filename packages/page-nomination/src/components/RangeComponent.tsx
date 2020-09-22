// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useEffect } from 'react';
import { Range } from 'react-range';
import { Icon, LabelHelp } from '@polkadot/react-components';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import linesSvg from './lines.svg';
import rangeSvg from './range.svg';

interface Props {
  activeRange: Array<number>;
  setActiveRange: (activeRange: Array<number>) => void;
}

function RangeComponent (props: Props): React.ReactElement<Props> {
  const [rangeHeaderClass, setRangeHeaderClass] = useState<string>('range-header');

  const {
    activeRange,
    setActiveRange,
  } = props;

  useEffect(() => {
    if (activeRange && activeRange[0] === 6) {
      setRangeHeaderClass('range-header right');
    } else {
      setRangeHeaderClass('range-header');
    }
  }, [activeRange]);

  return (
    <>
      <div className='range-block'>
        <div className='range-list'>
          <div className='item'>
            <div className='vertical-divider' />
            Conservative strategy
            <LabelHelp
              className='small-help'
              help='Conservative strategy'
            />
          </div>
          <div className='item'>
            <div className='vertical-divider' />
          </div>
          <div className='item'>
            <div className='vertical-divider' />
          </div>
          <div className='item'>
            <div className='vertical-divider' />
          </div>
          <div className='item'>
            <div className='vertical-divider' />
          </div>
          <div className='item'>
            Aggressive strategy
            <LabelHelp
              className='small-help'
              help='Aggressive strategy'
            />
          </div>
        </div>
        <Range
          step={1}
          min={0}
          max={6}
          values={activeRange}
          onChange={setActiveRange}
          renderTrack={({ props, children }) => (
            <div
              className='render-track'
              {...props}
              style={{
                ...props.style,
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              className='render-thumb'
              {...props}
              children={
                <>
                  <img src={linesSvg} />
                  <Header as='h2' className={rangeHeaderClass}>
                    Balanced strategy
                    <LabelHelp
                      className='small-help'
                      help='Conservative strategy'
                    />
                    <img className='range-polygon' src={rangeSvg} />
                  </Header>
                </>
              }
            />
          )}
        />
      </div>
      <span className='strategy-name'>
             <Icon icon='info-circle' />
             Now the 'Balanced strategy' is installed. If you change the candidates below, the strategy will become a 'Manual'
           </span>
    </>
  )
}

export default React.memo(RangeComponent);
