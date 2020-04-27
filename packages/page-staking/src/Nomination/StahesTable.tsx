import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '@polkadot/react-components';
import NominatedAccount from '@polkadot/app-staking/Nomination/NominatedAccount';
import { useApi, useCall } from '@polkadot/react-hooks';
import { useTranslation } from '@polkadot/app-staking/translate';
import { ActiveEraInfo, EraIndex } from '@polkadot/types/interfaces';
import { Option } from '@polkadot/types';
import { DeriveStakingOverview, DeriveStakerReward } from '@polkadot/api-derive/types';
// import Account from "@polkadot/app-staking/Actions/Account";

interface Props {
  allRewards?: Record<string, DeriveStakerReward[]>;
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
  validators?: string[];
}

function StashesTable({ className, allStashes, isInElection, validators, isVisible, next, allRewards, stakingOverview, controllerAccountId, ownStashes, onUpdateControllerState, onUpdateNominatedState }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { t } = useTranslation();
  const [foundStashes, setFoundStashes] = useState<[string, boolean][] | null>(null);
  const [stashTypes, setStashTypes] = useState<Record<string, number>>({});
  const activeEra = useCall<EraIndex | undefined>(api.query.staking?.activeEra, [], {
    transform: (activeEra: Option<ActiveEraInfo>): EraIndex | undefined =>
      activeEra.isSome
        ? activeEra.unwrap().index
        : undefined
  });

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
      {/*<Table.Body empty={t('No funds staked yet. Bond funds to validate or nominate a validator.')}>

      </Table.Body>*/}
      {foundStashes?.map(([stashId, isOwnStash]: Array<any>): React.ReactNode => (
        <NominatedAccount
          selectedControllerId={controllerAccountId}
          activeEra={activeEra}
          allStashes={allStashes}
          isDisabled={isInElection}
          isOwnStash={isOwnStash}
          key={stashId}
          next={next}
          onUpdateType={_onUpdateType}
          stashId={stashId}
          validators={validators}
          onUpdateControllerState={onUpdateControllerState}
          onUpdateNominatedState={onUpdateNominatedState}
          rewards={allRewards && allRewards[stashId]}
          stakingOverview={stakingOverview}
        />
      ))}
     {/* {foundStashes?.map(([stashId, isOwnStash]): React.ReactNode => (
        <Account
          activeEra={activeEra}
          allStashes={allStashes}
          isDisabled={isInElection}
          isOwnStash={isOwnStash}
          key={stashId}
          next={next}
          onUpdateType={_onUpdateType}
          stashId={stashId}
          validators={validators}
        />
      ))}*/}
    </Table>
  )
}

export default React.memo(StashesTable);