// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '@polkadot/react-components';
import NominatedAccount from '@polkadot/app-staking/Nomination/NominatedAccount';
import { useTranslation } from '@polkadot/app-staking/translate';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';

interface Props {
  controllerAccountId?: string | null;
  className?: string;
  allStashes?: string[];
  isVisible: boolean;
  next?: string[];
  stakingOverview?: DeriveStakingOverview;
  ownStashes?: [string, boolean][];
  onUpdateControllerState: (controllerAlreadyBonded: boolean) => void;
  onUpdateNominatedState: (controllerAlreadyBonded: boolean) => void;
  isInElection?: boolean;
  selectedValidators: string[];
}

function StashesTable ({ allStashes, controllerAccountId, next, onUpdateControllerState, onUpdateNominatedState, ownStashes, selectedValidators, stakingOverview }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [foundStashes, setFoundStashes] = useState<[string, boolean][] | null>(null);
  const [stashTypes, setStashTypes] = useState<Record<string, number>>({});

  const _onUpdateType = useCallback(
    (stashId: string, type: 'validator' | 'nominator' | 'started' | 'other'): void =>
      setStashTypes((stashTypes: Record<string, number>) => ({
        ...stashTypes,
        [stashId]: type === 'validator'
          ? 1
          : type === 'nominator'
            ? 5
            : 9
      })),
    []
  );

  useEffect((): void => {
    ownStashes && setFoundStashes(
      ownStashes.sort((a, b): number =>
        (stashTypes[a[0]] || 99) - (stashTypes[b[0]] || 99)
      )
    );
  }, [ownStashes, stashTypes]);

  return (
    <Table
      empty={t('No funds staked yet. Bond funds to validate or nominate a validator')}
      header={[
        [t('stashes'), 'start'],
        [t('controller'), 'address'],
        [t('rewards'), 'number'],
        [t('bonded'), 'number'],
        [undefined, undefined, 2]
      ]}
    >
      {foundStashes?.map(([stashId]: Array<any>): React.ReactNode => (
        <NominatedAccount
          allStashes={allStashes}
          key={stashId}
          next={next}
          onUpdateControllerState={onUpdateControllerState}
          onUpdateNominatedState={onUpdateNominatedState}
          onUpdateType={_onUpdateType}
          selectedControllerId={controllerAccountId}
          selectedValidators={selectedValidators}
          stakingOverview={stakingOverview}
          stashId={stashId}
        />
      ))}
    </Table>
  );
}

export default React.memo(StashesTable);
