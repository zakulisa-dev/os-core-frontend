import { Base8BallPersona, BaseBallPersona8Type } from './8ball.types';

const base8BallPersonas: Record<Base8BallPersona, BaseBallPersona8Type> = {
  aristocrat: {
    prefix: "🎩",
    style: (text: string) => `Indeed, my dear. ${text}`,
  },
  robot: {
    prefix: "🤖",
    style: (text: string) => `Calculation complete. Outcome: ${text}`,
  },
  wizard: {
    prefix: "🧙",
    style: (text: string) => `The runes foresee... ${text}`,
  },
  baby: {
    prefix: "👶",
    style: (text: string) => `uhh... ${text}?`,
  },
  classic: {
    prefix: "🎱",
    style: (text: string) => text,
  },
};

const base8BallResponses = [
  "Yes.", "No.", "Maybe.", "Definitely.", "Ask again later.",
  "Unlikely.", "Certainly.", "Don't count on it.", "Possibly.",
  "I don't know.", "Time will tell.", "Soon™", "You're not ready for the answer.",
  "The void whispers no.", "Absolutely.", "Very doubtful.",
];

export { base8BallPersonas, base8BallResponses };
