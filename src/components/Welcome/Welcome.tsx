import { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import space from '@Backgrounds/space.png';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { DialogueManager } from '@Features/dialogSystem/DialogueManager';
import { welcomeFirstVisit, welcomeReturningVisit } from '@Features/dialogSystem/scenarios/welcome.scenario';
import { DialogueNode } from '@Features/dialogSystem/useDialogue';
import styles from './welcome.module.css';

interface Props extends ChildrenNever {
  handleWelcomeClose: () => void;
}

const Welcome: FC<Props> = ({ handleWelcomeClose }: Props) => {
  const username = localStorage.getItem('username') || '';
  const navigate = useNavigate();

  const scenario = useMemo(() => {
    const baseScenario = username
      ? welcomeReturningVisit(username)
      : welcomeFirstVisit;

    return baseScenario.map((node): DialogueNode => {
      if (node.id === 'choice_register') {
        return {
          ...node,
          onComplete: () => {
            sessionStorage.setItem('isWelcomeOpen', 'No');
            navigate('/register');
          },
        };
      }
      if (node.id === 'choice_guest') {
        return {
          ...node,
          onComplete: handleWelcomeClose,
        };
      }
      if (node.id === 'choice_login') {
        return {
          ...node,
          onComplete: () => {
            sessionStorage.setItem('isWelcomeOpen', 'No');
            navigate('/login');
          },
        };
      }
      return node;
    });
  }, [username, navigate, handleWelcomeClose]);

  return (
    <>
      <div className={styles.overlay} style={{ backgroundImage: `url(${space})` }} />
      <motion.main
        className={styles.main}
        exit={{ opacity: 0, y: '-50%' }}
        transition={{ duration: 1 }}
      >
        <DialogueManager
          scenario={scenario}
          onComplete={handleWelcomeClose}
          vixieImage={'/assets/images/vixie.jpeg'}
          foxImage={'/assets/images/fox.jpeg'}
        />
      </motion.main>
    </>
  );
};

export { Welcome };