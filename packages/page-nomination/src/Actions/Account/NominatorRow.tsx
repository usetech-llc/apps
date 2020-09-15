// const stakerPoints = useCall<DeriveStakerPoints[]>(api.derive.staking.stakerPoints, [validatorId, true]);

import React from 'react';
import { AddressMini } from '@polkadot/react-components/index';
interface Props {
  validatorId: string;
}

function NominatorRow (props: Props): React.ReactElement<Props> {
  const { validatorId } = props;

  return (
    <div className='account-block' key={validatorId}>
      <AddressMini
        value={validatorId}
        withBonded
      />
      <div className='other-stake'>
        18.316 KSM
      </div>
      <div className='own-stake'>
        18.316 KSM
      </div>
      <div className='commission'>
        0.00%
      </div>
      <div className='points'>
        140
      </div>
    </div>
  )
}

export default React.memo(NominatorRow);
