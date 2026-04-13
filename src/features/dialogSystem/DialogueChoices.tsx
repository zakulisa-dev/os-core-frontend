import { FC } from 'react';
import { motion } from 'framer-motion';
import { DialogueChoice } from './useDialogue';
import styles from './DialogueChoices.module.css';

interface Props {
  choices: DialogueChoice[];
  onChoice: (next: string) => void;
}

export const DialogueChoices: FC<Props> = ({ choices, onChoice }) => {
  return (
    <motion.div
      className={styles.choices}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {choices.map((choice, index) => (
        <motion.button
          key={choice.next}
          className={styles.choice}
          onClick={() => onChoice(choice.next)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index }}
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className={styles.arrow}>→</span>
          {choice.text}
        </motion.button>
      ))}
    </motion.div>
  );
};