// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';

import LabelHelp from './LabelHelp';
import { classes } from './util';

interface Props {
  className?: string;
  help?: React.ReactNode;
  isHidden?: boolean;
  isFull?: boolean;
  isOuter?: boolean;
  isSmall?: boolean;
  label?: React.ReactNode;
  labelExtra?: React.ReactNode;
  children: React.ReactNode;
  withEllipsis?: boolean;
  withLabel?: boolean;
}

function Labelled ({ className = '', children, help, isFull, isHidden, isOuter, isSmall, label, labelExtra, withEllipsis, withLabel = true }: Props): React.ReactElement<Props> | null {
  if (isHidden) {
    return null;
  } else if (!withLabel) {
    return (
      <div className={className}>{children}</div>
    );
  }

  return (
    <div className={classes('ui--Labelled', isSmall && 'label-small', isFull && 'label-full', isOuter && 'label-outer', className)}>
      {label &&
      <label>
        {
          withEllipsis
            ? <div className='withEllipsis'>{label}</div>
            : label
        }{help && <LabelHelp help={help}/>}
      </label>
      }
      {labelExtra && <div className='labelExtra'>{labelExtra}</div>}
      <div className='ui--Labelled-content'>
        {children}
      </div>
    </div>
  );
}

export default React.memo(Labelled);
