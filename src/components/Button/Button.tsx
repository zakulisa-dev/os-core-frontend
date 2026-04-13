import React, { ButtonHTMLAttributes, FC, ForwardedRef, ReactNode } from 'react';

import styles from './button.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  type?: 'reset' | 'submit' | 'button';
  transparent?: boolean;
  forwardedRef?: ForwardedRef<HTMLButtonElement>;
}

const Button: FC<Props> = React.memo(({ children, className, type = 'button', forwardedRef, transparent, ...props }: Props) => (
  <button className={`${styles.button} ${className} ${transparent ? styles.transparent : ''}`} type={type} {...props} ref={forwardedRef}>
    {children}
  </button>
));

Button.displayName = 'Button';

export { Button };
