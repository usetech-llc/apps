// Copyright 2017-2020 @polkadot/app-nomination authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// global app props
import { AppProps as Props } from '@polkadot/react-components/types';
import { DeriveStakingOverview } from '@polkadot/api-derive/types';
import { ElectionStatus } from '@polkadot/types/interfaces';

// external imports (including those found in the packages/*
// of this repo)
import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import BN from 'bn.js';
import styled from 'styled-components';
import { Button, HelpOverlay, InputBalance, StatusContext } from '@polkadot/react-components';
import basicMd from '@polkadot/app-staking/md/basic.md';
import { useApi, useCall, useOwnStashInfos, useStashIds } from '@polkadot/react-hooks';
import useValidators from '@polkadot/app-staking/Nomination/useValidators';
import { useTranslation } from '@polkadot/app-accounts/translate';
import { QrDisplayAddress } from '@polkadot/react-qr';
import useSortedTargets from '@polkadot/app-staking/useSortedTargets';
import keyring from '@polkadot/ui-keyring';
import { web3FromSource } from '@polkadot/extension-dapp';
import EraToTime from '@polkadot/app-staking/Nomination/EraToTime';

// local imports and components
import AccountSelector from './AccountSelector';
import WalletSelector from './WalletSelector';
import Available from './Available';
import Actions from './Actions';
import { useFees, WholeFeesType } from './useBalance';

interface Validators {
  next?: string[];
  validators?: string[];
}

function Nomination ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const ownStashes = useOwnStashInfos();
  const targets = useSortedTargets();
  const allStashes = useStashIds();
  const stakingOverview = useCall<DeriveStakingOverview>(api.derive.staking.overview, []);
  const isInElection = useCall<boolean>(api.query.staking?.eraElectionStatus, [], {
    transform: (status: ElectionStatus) => status.isOpen
  });
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const { filteredValidators, validatorsLoading } = useValidators();
  const [{ next, validators }, setValidators] = useState<Validators>({});
  const [accountId, setAccountId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [percent, setPercent] = useState(33);
  const [amount, setAmount] = useState<BN | undefined | null>(null);
  const accountSegment: any = useRef(null);
  const { feesLoading, wholeFees }: WholeFeesType = useFees(accountId, selectedValidators);
  const { queueExtrinsic } = useContext(StatusContext);
  const extrinsicBond = (amount && accountId)
    ? api.tx.staking.bond(accountId, amount, 2)
    : null;
  const extrinsicNominate = (amount && accountId)
    ? api.tx.staking.nominate(selectedValidators)
    : null;

  const startNomination = useCallback(() => {
    if (!extrinsicBond || !extrinsicNominate || !accountId) {
      return;
    }

    const txs = [extrinsicBond, extrinsicNominate];

    api.tx.utility
      .batch(txs)
      .signAndSend(accountId, ({ status }) => {
        if (status.isInBlock) {
          console.log(`included in ${status.asInBlock}`);
          // @todo - сообщить пользователю
          // @todo - unbond warning!!!
        }
      });
  }, [accountId, api.tx.utility, extrinsicBond, extrinsicNominate]);

  /* const startNomination = useCallback(() => {
    const extrinsicNominate = (amount && accountId)
      ? api.tx.staking.nominate(selectedValidators)
      : null;

    if (!extrinsicNominate) {
      return;
    }

    queueExtrinsic({
      accountId: accountId && accountId.toString(),
      extrinsicNominate,
      isUnsigned: undefined,
      txFailedCb: () => { console.log('failed'); },
      txStartCb: () => { console.log('start'); },
      txSuccessCb: () => { console.log('success'); },
      txUpdateCb: () => { console.log('update'); }
    });
    assert(false, 'Unable to find api.tx.');
  }, [accountId, amount]);

  const startBond = useCallback(() => {
    // bond();
    const extrinsicBond = (amount && accountId)
      ? api.tx.staking.bond(accountId, amount, 2)
      : null;

    if (!extrinsicBond) {
      return;
    }

    queueExtrinsic({
      accountId: accountId && accountId.toString(),
      extrinsicBond,
      isUnsigned: undefined,
      txFailedCb: () => { console.log('failed'); },
      txStartCb: () => { console.log('start'); },
      txSuccessCb: () => { startNomination(); },
      txUpdateCb: () => { console.log('update'); }
    });
  }, [accountId, amount]); */

  const setSigner = useCallback(async () => {
    if (!accountId) {
      return;
    }

    const pair = keyring.getAddress(accountId, null);
    const { meta: { source } } = pair;
    const injected = await web3FromSource(source);

    api.setSigner(injected.signer);
  }, [accountId, api]);

  /**
   * Set validators list.
   * If filtered validators
   */
  useEffect(() => {
    if (filteredValidators && filteredValidators.length) {
      setSelectedValidators(
        filteredValidators.map((validator): string => validator.key).slice(0, 16)
      );
    } else {
      stakingOverview && setSelectedValidators(
        stakingOverview.validators.map((acc): string => acc.toString()).slice(0, 16)
      );
    }
  }, [filteredValidators, stakingOverview]);

  useEffect(() => {
    if (!accountId) {
      return;
    }

    setSigner().then();
  }, [accountId, setSigner]);

  useEffect((): void => {
    allStashes && stakingOverview && setValidators({
      next: allStashes.filter((address) => !stakingOverview.validators.includes(address as any)),
      validators: stakingOverview.validators.map((a) => a.toString())
    });
  }, [allStashes, stakingOverview]);

  useEffect(() => {
    if (accountSegment && accountSegment.current) {
      window.scrollTo(0, accountSegment.current.offsetTop);
    }
  }, []);

  return (
    // in all apps, the main wrapper is setup to allow the padding
    // and margins inside the application. (Just from a consistent pov)
    <main className={`nomination-app ${className}`}>
      <HelpOverlay md={basicMd} />
      <div className='ui placeholder segment'>
        <WalletSelector
          onChange={setWallet}
          title={'Connect to a wallet'}
          value={wallet}
        />
      </div>
      <div
        className='ui placeholder segment'
        ref={accountSegment}
      >
        <AccountSelector
          onChange={setAccountId}
          title={'Your account'}
          value={accountId}
        />
        {accountId && (
          <Available
            params={accountId}
          />
        )}
        {accountId &&
        <QrDisplayAddress
          address={accountId}
          className={'qr-center'}
          genesisHash={api.genesisHash.toHex()}
          size={200}
        />
        }
      </div>
      <div className='ui placeholder segment'>
        <h2>{t('Enter the amount you would like to Nominate and click Start:')}</h2>
        <InputBalance
          isFull
          label={t('amount to bond')}
          onChange={setAmount}
        />
        <h4 className='ui orange header'>
          {t('Warning: After bonding, your funds will be locked and will remain locked after the nomination is stopped for')} <EraToTime showBlocks />, {t('which is approximately')} <EraToTime showDays />.
        </h4>
        <Button.Group>
          <Button
            icon='play'
            label={'Start'}
            onClick={startNomination}
          />
          {/*<DoubleTxButton
            accountId={accountId}
            extrinsics={[extrinsicBond, extrinsicNominate]}
            icon='play'
            isPrimary
            label={'Start'}
          />*/}
          {/* <TxButton
            accountId={accountId}
            extrinsic={extrinsicBond}
            icon='sign-in'
            isPrimary
            label={t('Start')}
            onSuccess={nominate}
          /> */}
        </Button.Group>
      </div>
      <div className='ui placeholder segment'>
        <Actions
          hideNewStake
          isInElection={isInElection}
          next={next}
          ownStashes={ownStashes}
          targets={targets}
          validators={validators}
        />
      </div>
      {/* <div className='ui placeholder segment'>
        <Button
          icon='add'
          label={'Just click to Nominate'}
          onClick={startNomination}
        />
        <Progress
          indicating
          percent={percent}
        />
        <div className='ui list'>
          <div className='item'>
            <div className='header'>Bond</div>
            <div className='description'>
              Bonding funds...
            </div>
          </div>
          <div className='item'>
            <div className='header'>Nominate</div>
            <div className='description'>
              Nominating...
            </div>
          </div>
        </div>
      </div> */}
    </main>
  );
}

export default React.memo(styled(Nomination)`
   max-width: 800px;
   
   .qr-center {
     margin: 0 auto;
   }
   
   .ui.header:before {
      display: none !important;
   }
`);
