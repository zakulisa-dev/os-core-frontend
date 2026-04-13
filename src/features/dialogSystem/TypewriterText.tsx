import { FC, useEffect, useState } from 'react';
import { useDialogue } from './useDialogue';

interface Props {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const TypewriterText: FC<Props> = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const setTyping = useDialogue((state) => state.setTyping);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setTyping(true);
  }, [text, setTyping]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && text.length > 0) {
      setTyping(false);
      if (onComplete) onComplete();
    }
  }, [currentIndex, text, speed, onComplete, setTyping]);

  return <span>{displayedText}</span>;
};