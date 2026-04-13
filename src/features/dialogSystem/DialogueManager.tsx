import { FC, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDialogue, DialogueNode } from './useDialogue';
import { DialogueBox } from './DialogueBox';

interface Props {
  scenario: DialogueNode[];
  onComplete?: () => void;
  foxImage?: string;
  vixieImage?: string;
}

export const DialogueManager: FC<Props> = ({
                                             scenario,
                                             onComplete,
                                             foxImage,
                                             vixieImage
                                           }) => {
  const { isActive, startDialogue, reset } = useDialogue();

  useEffect(() => {
    if (scenario.length > 0) {
      const scenarioWithCallback = scenario.map((node, index) => {
        if (index === scenario.length - 1 && onComplete) {
          return { ...node, onComplete };
        }
        return node;
      });
      startDialogue(scenarioWithCallback);
    }

    return () => reset();
  }, [scenario, onComplete, startDialogue, reset]);

  return (
    <AnimatePresence>
      {isActive && <DialogueBox foxImage={foxImage} vixieImage={vixieImage} />}
    </AnimatePresence>
  );
};