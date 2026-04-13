import { FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import space from '@Backgrounds/space.webp';
import { Button } from '@Components/Button/Button';

import styles from './registration.module.css';

const Registration: FC<ChildrenNever> = () => {
  const [formError, setFormError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordVisible2, setIsPasswordVisible2] = useState(false);
  const registrationError = '';
  const isRegistrationLoading = false;

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    mode: 'onBlur',
  });

  useEffect(() => {
    setFormError(registrationError);
  }, [registrationError]);

  function handleTogglePasswordVisible() {
    setIsPasswordVisible((value) => !value);
  }

  function handleTogglePasswordVisible2() {
    setIsPasswordVisible2((value) => !value);
  }

  function handleRegistration() {
  }

  return (
    <>
      <div className={styles.overlay} style={{ backgroundImage: `url(${space})` }} />
      <div className={styles.wrapper}>
        <Button onClick={() => navigate('/')} className={styles.closeBtn}>
          ←
        </Button>
        <form className={styles.loginForm} onSubmit={handleSubmit(handleRegistration)}>
          <span className={`${styles.formErrorDefault} ${formError ? styles.formError : ''}`}>
            {formError || 'error'}
          </span>
          <label htmlFor="loginName" className={styles.label}>
            <span className={`${styles.inputErrorDefault} ${errors.username ? styles.inputError : ''}`}>
              {(errors.username?.message as never) || 'Error'}
            </span>
            <div className={styles.inputBtnContainer}>
              <div className={styles.empty} />
              <input
                type="text"
                id="loginName"
                placeholder="Username"
                className={errors.username ? styles.invalidInput : ''}
                onFocus={() => setFormError('')}
                {...register('username', {
                  required: {
                    value: true,
                    message: 'You must fill this field',
                  },
                  pattern: {
                    value: /^[A-z0-9_-]+$/,
                    message: 'Username must contain only letters, numbers, dash and underscore',
                  },
                  minLength: {
                    value: 5,
                    message: 'Username must be at least 5 characters',
                  },
                  maxLength: {
                    value: 20,
                    message: 'Username must be no more then 20 characters',
                  },
                })}
              />
              <div className={styles.empty} />
            </div>
          </label>
          <label htmlFor="loginPassword" className={styles.label}>
            <span className={`${styles.inputErrorDefault} ${errors.password ? styles.inputError : ''}`}>
              {(errors.password?.message as never) || 'Error'}
            </span>
            <div className={styles.inputBtnContainer}>
              <div className={styles.empty} />
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                id="loginPassword"
                className={errors.password ? styles.invalidInput : ''}
                placeholder="Password"
                onFocus={() => setFormError('')}
                {...register('password', {
                  required: {
                    value: true,
                    message: 'You must fill this field',
                  },
                  minLength: {
                    value: 5,
                    message: 'Password must be at least 5 characters',
                  },
                  maxLength: {
                    value: 20,
                    message: 'Password must be no more then 20 characters',
                  },
                })}
              />
              <Button className={styles.changePasswordVisibility} onClick={handleTogglePasswordVisible}>
                {isPasswordVisible ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
              </Button>
            </div>
          </label>
          <label htmlFor="loginPassword" className={styles.label}>
            <span className={`${styles.inputErrorDefault} ${errors.passwordConfirmation ? styles.inputError : ''}`}>
              {(errors.passwordConfirmation?.message as never) || 'Error'}
            </span>
            <div className={styles.inputBtnContainer}>
              <div className={styles.empty} />
              <input
                type={isPasswordVisible2 ? 'text' : 'password'}
                id="loginPasswordConfirmation"
                className={errors.passwordConfirmation ? styles.invalidInput : ''}
                placeholder="Password confirmation"
                onFocus={() => setFormError('')}
                {...register('passwordConfirmation', {
                  validate: (value) => value === getValues('password') || 'Passwords should be equals',
                })}
              />
              <Button className={styles.changePasswordVisibility} onClick={handleTogglePasswordVisible2}>
                {isPasswordVisible2 ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
              </Button>
            </div>
          </label>
          <div className={styles.btnContainer}>
            <Button type="submit" className={styles.signUp} disabled={isRegistrationLoading}>
              Sign Up
            </Button>
          </div>
          <p className={styles.registration}>
            {'Already have an account? '}
            <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>
    </>
  );
};

export { Registration };
