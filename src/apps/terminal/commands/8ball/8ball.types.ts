interface BaseBallPersona8Type {
  prefix: string;
  style: (text: string) => string;
}

enum Base8BallPersona {
  Aristocrat = 'aristocrat',
  Robot = 'robot',
  Wizard = 'wizard',
  Baby = 'baby',
  Classic = 'classic',
}

export { Base8BallPersona };
export type { BaseBallPersona8Type };
