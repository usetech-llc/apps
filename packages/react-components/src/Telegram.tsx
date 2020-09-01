// Copyright 2017-2020 UseTech authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import telegram from '@polkadot/app-nomination/assets/img/telegram.png';
import { useTranslation } from './translate';

interface TelegramProps {
  isKusama: boolean;
}

const TelegramNotifications: React.FC<TelegramProps> = ({ isKusama }) => {
  const { t } = useTranslation();

  return (
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
  )
};

export default React.memo(TelegramNotifications);
