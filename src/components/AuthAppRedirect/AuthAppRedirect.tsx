import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { Button } from '@Components/Button/Button';

import styles from './authAppRedirect.module.css';

const AuthAppRedirectComponent: FC<ChildrenNever> = () => {
  const navigate = useNavigate();

  const { t } = useTranslation('authRedirect');

  function handleClick() {
    navigate('/login');
  }

  return (
    <div className={styles.container}>
      <p className={styles.text}>{t('authRedirect.pleaseLogin')}</p>
      <Button onClick={handleClick} className={styles.btn}>
        {t('authRedirect.goToLogin')}
      </Button>
    </div>
  );
};

const AuthAppRedirect = React.memo(AuthAppRedirectComponent);

export { AuthAppRedirect };
