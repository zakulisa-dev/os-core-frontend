import { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import space from '@Backgrounds/space.webp';
import { Button } from '@Components/Button/Button';
import { useRegister } from '@Features/user/user.queries';

import styles from './registration.module.css';

interface RegistrationForm {
  username: string;
  password: string;
  passwordConfirmation: string;
}

const Registration: FC<ChildrenNever> = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordVisible2, setIsPasswordVisible2] = useState(false);
  const navigate = useNavigate();
  const { mutate: registerUser, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RegistrationForm>({ mode: 'onBlur' });

  const handleRegistration = ({ username, password }: RegistrationForm) => {
    registerUser({ username, password });
  };

  return (
    <>
      <div className={styles.overlay} style={{ backgroundImage: `url(${space})` }} />
      <div className={styles.wrapper}>
        <Button onClick={() => navigate('/')} className={styles.closeBtn}>
          ←
        </Button>
        <form className={styles.loginForm} onSubmit={handleSubmit(handleRegistration)}>
          <span className={`${styles.formErrorDefault} ${error ? styles.formError : ''}`}>
            {error?.message || 'Error'}
          </span>
          <label htmlFor="loginName" className={styles.label}>
            <span className={`${styles.inputErrorDefault} ${errors.username ? styles.inputError : ''}`}>
              {errors.username?.message || 'Error'}
            </span>
            <div className={styles.inputBtnContainer}>
              <div className={styles.empty} />
              <input
                type="text"
                id="loginName"
                placeholder="Username"
                className={errors.username ? styles.invalidInput : ''}
                {...register('username', {
                  required: 'You must fill this field',
                  pattern: {
                    value: /^[A-z0-9_-]+$/,
                    message: 'Username must contain only letters, numbers, dash and underscore',
                  },
                  minLength: { value: 5, message: 'Username must be at least 5 characters' },
                  maxLength: { value: 20, message: 'Username must be no more than 20 characters' },
                })}
              />
              <div className={styles.empty} />
            </div>
          </label>
          <label htmlFor="loginPassword" className={styles.label}>
            <span className={`${styles.inputErrorDefault} ${errors.password ? styles.inputError : ''}`}>
              {errors.password?.message || 'Error'}
            </span>
            <div className={styles.inputBtnContainer}>
              <div className={styles.empty} />
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                id="loginPassword"
                placeholder="Password"
                className={errors.password ? styles.invalidInput : ''}
                {...register('password', {
                  required: 'You must fill this field',
                  minLength: { value: 5, message: 'Password must be at least 5 characters' },
                  maxLength: { value: 20, message: 'Password must be no more than 20 characters' },
                })}
              />
              <Button
                className={styles.changePasswordVisibility}
                onClick={() => setIsPasswordVisible((v) => !v)}
              >
                <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
              </Button>
            </div>
          </label>
          <label htmlFor="loginPasswordConfirmation" className={styles.label}>
            <span className={`${styles.inputErrorDefault} ${errors.passwordConfirmation ? styles.inputError : ''}`}>
              {errors.passwordConfirmation?.message || 'Error'}
            </span>
            <div className={styles.inputBtnContainer}>
              <div className={styles.empty} />
              <input
                type={isPasswordVisible2 ? 'text' : 'password'}
                id="loginPasswordConfirmation"
                placeholder="Password confirmation"
                className={errors.passwordConfirmation ? styles.invalidInput : ''}
                {...register('passwordConfirmation', {
                  validate: (value) => value === getValues('password') || 'Passwords should be equal',
                })}
              />
              <Button
                className={styles.changePasswordVisibility}
                onClick={() => setIsPasswordVisible2((v) => !v)}
              >
                <FontAwesomeIcon icon={isPasswordVisible2 ? faEyeSlash : faEye} />
              </Button>
            </div>
          </label>
          <div className={styles.btnContainer}>
            <Button type="submit" className={styles.signUp} disabled={isPending}>
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