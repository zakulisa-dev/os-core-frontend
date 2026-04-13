import React, { useState, useCallback, useEffect, FC } from 'react';
import { AppInstanceId } from '@nameless-os/sdk';
import styles from './bullsAndCows.module.css';

interface Props {
  instanceId: AppInstanceId;
}

interface GameAttempt {
  guess: string;
  bulls: number;
  cows: number;
}

const BullsAndCows: FC<Props> = ({ instanceId }) => {
  const [secretNumber, setSecretNumber] = useState<string>('');
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [attempts, setAttempts] = useState<GameAttempt[]>([]);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);

  const generateSecretNumber = useCallback((): string => {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const result = [];

    const firstDigitIndex = Math.floor(Math.random() * 9) + 1;
    result.push(digits[firstDigitIndex]);
    digits.splice(firstDigitIndex, 1);

    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      result.push(digits[randomIndex]);
      digits.splice(randomIndex, 1);
    }

    return result.join('');
  }, []);

  const initGame = useCallback(() => {
    const newSecret = generateSecretNumber();
    setSecretNumber(newSecret);
    setCurrentGuess('');
    setAttempts([]);
    setIsWon(false);
    setAttemptsCount(0);
    console.log('Secret number:', newSecret);
  }, [generateSecretNumber]);

  const checkGuess = useCallback((guess: string, secret: string) => {
    let bulls = 0;
    let cows = 0;

    const guessArray = guess.split('');
    const secretArray = secret.split('');
    const usedSecretIndices: boolean[] = new Array(4).fill(false);
    const usedGuessIndices: boolean[] = new Array(4).fill(false);

    for (let i = 0; i < 4; i++) {
      if (guessArray[i] === secretArray[i]) {
        bulls++;
        usedSecretIndices[i] = true;
        usedGuessIndices[i] = true;
      }
    }

    for (let i = 0; i < 4; i++) {
      if (!usedGuessIndices[i]) {
        for (let j = 0; j < 4; j++) {
          if (!usedSecretIndices[j] && guessArray[i] === secretArray[j]) {
            cows++;
            usedSecretIndices[j] = true;
            break;
          }
        }
      }
    }

    return { bulls, cows };
  }, []);

  const isValidGuess = useCallback((guess: string): boolean => {
    if (guess.length !== 4) return false;
    if (!/^\d{4}$/.test(guess)) return false;

    const digits = guess.split('');
    const uniqueDigits = new Set(digits);
    return uniqueDigits.size === 4;
  }, []);

  const handleSubmitGuess = useCallback(() => {
    if (!isValidGuess(currentGuess)) {
      alert('Введите 4-значное число без повторяющихся цифр');
      return;
    }

    const result = checkGuess(currentGuess, secretNumber);
    const newAttempt: GameAttempt = {
      guess: currentGuess,
      bulls: result.bulls,
      cows: result.cows
    };

    setAttempts(prev => [...prev, newAttempt]);
    setAttemptsCount(prev => prev + 1);

    if (result.bulls === 4) {
      setIsWon(true);
    }

    setCurrentGuess('');
  }, [currentGuess, secretNumber, isValidGuess, checkGuess]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCurrentGuess(value);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isWon) {
      handleSubmitGuess();
    }
  }, [handleSubmitGuess, isWon]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🐄 Быки и Коровы 🐂</h1>
        <p className={styles.subtitle}>Угадай 4-значное число без повторяющихся цифр</p>
      </div>

      <div className={styles.gameBoard}>
        <div className={styles.gameStatus}>
          <p>Попытка: {attemptsCount + 1}</p>
          {isWon && (
            <div className={styles.winMessage}>
              🎉 Поздравляем! Вы угадали число {secretNumber} за {attemptsCount} попыток!
            </div>
          )}
        </div>

        {!isWon && (
          <div className={styles.inputSection}>
            <input
              type="text"
              value={currentGuess}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Введите 4 цифры"
              className={styles.input}
              maxLength={4}
              autoFocus
            />
            <button
              onClick={handleSubmitGuess}
              disabled={!isValidGuess(currentGuess)}
              className={styles.submitButton}
            >
              Проверить
            </button>
          </div>
        )}

        <button
          onClick={initGame}
          className={styles.newGameButton}
        >
          Новая игра
        </button>

        {attempts.length > 0 && (
          <div className={styles.historySection}>
            <h3 className={styles.historyTitle}>История попыток:</h3>
            <div className={styles.historyList}>
              {attempts.map((attempt, index) => (
                <div key={index} className={styles.historyItem}>
                  <span className={styles.guess}>{attempt.guess}</span>
                  <span className={styles.result}>
                    <span className={styles.bulls}>🐂 {attempt.bulls}</span>
                    <span className={styles.cows}>🐄 {attempt.cows}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.rulesSection}>
          <h3 className={styles.rulesTitle}>Правила игры:</h3>
          <ul className={styles.rulesList}>
            <li><strong>Бык (🐂)</strong> - правильная цифра на правильном месте</li>
            <li><strong>Корова (🐄)</strong> - правильная цифра на неправильном месте</li>
            <li>Число состоит из 4 уникальных цифр</li>
            <li>Первая цифра не может быть 0</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export { BullsAndCows };
