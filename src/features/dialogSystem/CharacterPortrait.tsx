import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CharacterPortrait.module.css';

interface Props {
  speaker: 'fox' | 'vixie';
  position: 'left' | 'right';
  emotion?: 'neutral' | 'excited' | 'tired' | 'ironic';
  imageSrc?: string;
}

export const CharacterPortrait: FC<Props> = ({
                                               speaker,
                                               position,
                                               emotion = 'neutral',
                                               imageSrc
                                             }) => {
  const getPlaceholderColor = () => {
    if (speaker === 'fox') return '#2a2a2a';
    return '#d4814e';
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`${styles.portrait} ${styles[position]}`}
        initial={{ opacity: 0, x: position === 'left' ? -100 : 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: position === 'left' ? -100 : 100 }}
        transition={{ duration: 0.3 }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={speaker}
            className={styles.image}
          />
        ) : (
          <div
            className={styles.placeholder}
            style={{ backgroundColor: getPlaceholderColor() }}
          >
            <span className={styles.name}>
              {speaker === 'fox' ? 'FOX' : 'VIXIE'}
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};