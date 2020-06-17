// Copyright 2020-2021 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { HelpOverlay, Icon } from '@polkadot/react-components';
import basicMd from '@polkadot/app-staking/md/basic.md';

import telegram from './assets/img/telegram.png';
import { useTranslation } from './translate';

interface Props {
  isKusama: boolean;
  showCloseButton?: boolean;
  showTelegram?: boolean;
}

function CloseBlock ({ isKusama, showCloseButton = false, showTelegram = false }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const closeWindow = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
  }, []);

  return (
    <>
      { showTelegram && (
        <a
          className='telegram-notification'
          href={isKusama ? 'https://t.me/Kusama_bot ' : 'https://t.me/Polkadot_Ryabina_bot'}
          rel='noreferrer noopener'
          target='_blank'
        >
          <img
            alt='telegram-img'
            src={telegram as string}
          />
          {t('Telegram Notification')}
        </a>
      )}
      <HelpOverlay
        className={'help-button-block'}
        md={basicMd as string}
      />
      { showCloseButton && (
        <a
          className='close-window'
          href='/'
          onClick={closeWindow}
        >
          <Icon name='close' />
        </a>
      )}
    </>
  );
}

export default React.memo(styled(CloseBlock)``);
