// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, {useCallback, useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';

const rootElement = typeof document === 'undefined'
  ? null // This hack is required for server side rendering
  : document.getElementById('tooltips');

interface Props {
  className?: string;
  dataFor?: string;
  description?: React.ReactNode;
  effect?: 'solid' | 'float';
  showDescription?: boolean;
  offset?: {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  };
  place?: 'bottom' | 'top' | 'right' | 'left';
  text: React.ReactNode;
  trigger: string;
  toggleDescription: () => void;
}

function Tooltip ({ className = '', description, effect = 'solid', showDescription, offset, place = 'top', text, trigger, toggleDescription }: Props): React.ReactElement<Props> | null {

  const [tooltipContainer] = useState(
    typeof document === 'undefined'
      ? {} as HTMLElement // This hack is required for server side rendering
      : document.createElement('div')
  );

  const onClickTooltipContent = useCallback((e) => {
    e.stopPropagation();
  }, []);

  useEffect((): () => void => {
    rootElement && rootElement.appendChild(tooltipContainer);

    return (): void => {
      rootElement && rootElement.removeChild(tooltipContainer);
    };
  }, [tooltipContainer]);

  return ReactDOM.createPortal(
    <ReactTooltip
      afterHide={showDescription ? toggleDescription : () => {}}
      className={`ui--Tooltip ${className}`}
      clickable
      isCapture={true}
      globalEventOff="click"
      event={'click'}
      effect={effect}
      id={trigger}
      offset={offset}
      place={place}
    >
      {className?.includes('address') ? (
        <div>{text}</div>
      ) : (
        <div onClick={onClickTooltipContent}>
          {text}
          {description && (
            <div className='tooltip-description'>
              { !showDescription && (
                <a onClick={toggleDescription}>Show more...</a>
              )}
              { showDescription && (
                <div className='description'>
                  {description}
                </div>
              )}
              { showDescription && (
                <a onClick={toggleDescription}>Hide</a>
              )}
            </div>
          )}
        </div>
      )}
    </ReactTooltip>,
    tooltipContainer
  );
}

export default React.memo(styled(Tooltip)`
  > div {
    overflow: hidden;
  }

  &.address div {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  table {
    border: 0;
    overflow: hidden;
    width: 100%;

    td {
      text-align: left;
    }

    td:first-child {
      opacity: 0.75;
      padding-right: 0.25rem;
      text-align: right;
      white-space: nowrap;
    }
  }

  div+table,
  table+div {
    margin-top: 0.75rem;
  }

  .faded {
    margin-top: -0.25rem;
    opacity: 0.75 !important;
    font-size: 0.85em !important;
  }

  .faded+.faded {
    margin-top: -0.5rem;
  }

  .row+.row {
    margin-top: 0.5rem;
  }
`);
