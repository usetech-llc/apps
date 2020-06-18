// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountId, StakingLedger } from '@polkadot/types/interfaces';

import BN from 'bn.js';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Bonded, InputAddress, InputBalance, Modal, Static, TxButton } from '@polkadot/react-components';
import { BlockToTime } from '@polkadot/react-query';

import { useTranslation } from '../../translate';
import useUnbondDuration from '../useUnbondDuration';

interface Props {
  className?: string;
  controllerId?: string | AccountId | null;
  onClose: () => void;
  stakingLedger?: StakingLedger;
  stashId: string;
}

function Unbond ({ className, controllerId, onClose, stakingLedger, stashId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const bondedBlocks = useUnbondDuration();
  const [maxBalance] = useState<BN | null>(stakingLedger?.active.unwrap() || null);
  const [maxUnbond, setMaxUnbond] = useState<BN | null>(null);

  // @ts-ignore
  return (
    <Modal
      className={`staking--Unbond ${className as string}`}
      header={t('Unbond funds')}
      size='large'
    >
      <Modal.Content className='ui--signer-Signer-Content'>
        <Modal.Columns>
          <Modal.Column>
            <InputAddress
              defaultValue={stashId}
              isDisabled
              label={t('stash account')}
            />
            <InputAddress
              defaultValue={controllerId}
              isDisabled
              label={t('controller account')}
            />
          </Modal.Column>
          <Modal.Column>
            <p>{t('The stash and controller pair, here the controller will be used to send the transaction.')}</p>
          </Modal.Column>
        </Modal.Columns>
        <Modal.Columns>
          <Modal.Column>
            <InputBalance
              autoFocus
              help={t('The amount of funds to unbond, this is adjusted using the bonded funds on the stash account.')}
              label={t('unbond amount')}
              labelExtra={
                <Bonded
                  label={<span className='label'>{t('bonded')}</span>}
                  params={stashId}
                />
              }
              maxValue={maxBalance}
              onChange={setMaxUnbond}
              withMax
            />
            {bondedBlocks?.gtn(0) && (
              <Static
                help={t('The bonding duration for any staked funds. After this period needs to be withdrawn.')}
                label={t('on-chain bonding duration')}
              >
                <BlockToTime blocks={bondedBlocks} />
              </Static>
            )}
          </Modal.Column>
          <Modal.Column>
            <p>{t('The funds will only be available for withdrawal after the unbonding period, however will not be part of the staked amount after the next validator election. You can follow the unlock countdown in the UI.')}</p>
          </Modal.Column>
        </Modal.Columns>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={controllerId}
          icon='sign-out'
          isDisabled={!maxUnbond?.gtn(0)}
          isPrimary
          label={t('Unbond')}
          onStart={onClose}
          params={[maxUnbond]}
          tx='staking.unbond'
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(styled(Unbond)`
  .staking--Unbond--max > div {
    justify-content: flex-end;

    & .column {
      flex: 0;
    }
  }
`);
