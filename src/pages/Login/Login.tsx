import { FC, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import space from '@Backgrounds/space.webp';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { Button } from '@Components/Button/Button';
import { useLogin } from '@Features/user/user.queries';

import styles from './login.module.css';

interface LoginForm {
  username: string;
  password: string;
}

const Login: FC<ChildrenNever> = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const handleLogin = ({ username, password }: LoginForm) => {
    login({ username, password });
  };

  return (
    <>
      <div className={styles.overlay} style={{ backgroundImage: `url(${space})` }} />
      <div className={styles.wrapper}>
        <Button onClick={() => navigate('/')} className={styles.closeBtn}>
          ←
        </Button>
        <form className={styles.loginForm} onSubmit={handleSubmit(handleLogin)}>
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
          <div className={styles.btnContainer}>
            <Button type="submit" disabled={isPending} className={styles.signIn}>
              Sign In
            </Button>
          </div>
          <p className={styles.registration}>
            {"Don't have an account? "}
            <Link to="/registration">Sign Up</Link>
          </p>
        </form>
      </div>
    </>
  );
};

export { Login };