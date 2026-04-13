import { FC, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDialogue } from './useDialogue';
import { TypewriterText } from './TypewriterText';
import { CharacterPortrait } from './CharacterPortrait';
import { DialogueChoices } from './DialogueChoices';
import styles from './DialogueBox.module.css';

interface Props {
  foxImage?: string;
  vixieImage?: string;
}

export const DialogueBox: FC<Props> = ({ foxImage, vixieImage }) => {
  const { currentNode, isTyping, nextNode, skipDialogue } = useDialogue();

  useEffect(() => {
    if (!currentNode || isTyping || currentNode.choices) return;

    if (currentNode.autoNext !== null && currentNode.autoNext !== undefined) {
      const timeout = setTimeout(() => {
        nextNode();
      }, currentNode.autoNext);

      return () => clearTimeout(timeout);
    }
  }, [currentNode, isTyping, nextNode]);

  if (!currentNode) return null;

  const handleClick = () => {
    if (isTyping) return;
    if (currentNode.choices) return;
    nextNode();
  };

  const speakerImage = currentNode.speaker === 'fox' ? foxImage : vixieImage;

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={styles.container}>
        <motion.div
          className={styles.box}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <button
            className={styles.skip}
            onClick={skipDialogue}
            aria-label="Skip dialogue"
          >
            Skip
          </button>

          <div className={styles.content}>
            <div className={styles.portraitSection}>
              <CharacterPortrait
                speaker={currentNode.speaker}
                position={currentNode.position}
                emotion={currentNode.emotion}
                imageSrc={speakerImage}
              />
              <span className={styles.speaker}>
                {currentNode.speaker === 'fox' ? 'Fox' : 'Vixie'}
              </span>
            </div>

            <div className={styles.textSection}>
              <div
                className={styles.text}
                onClick={handleClick}
                style={{ cursor: currentNode.choices ? 'default' : 'pointer' }}
              >
                <TypewriterText text={currentNode.text} />
                {!isTyping && !currentNode.choices && currentNode.autoNext === null && (
                  <motion.span
                    className={styles.continue}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, repeat: Infinity, duration: 1.5 }}
                  >
                    ▼
                  </motion.span>
                )}
              </div>

              {!isTyping && currentNode.choices && (
                <DialogueChoices choices={currentNode.choices} onChoice={nextNode} />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};