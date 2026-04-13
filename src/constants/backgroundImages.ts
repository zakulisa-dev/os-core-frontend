import { Background } from '@Features/settings/enums';

const backgroundImagesAssets: Record<Background, string> = {
  [Background.Car]: 'assets/backgrounds/car.webp',
  [Background.Fog]: 'assets/backgrounds/fog.webp',
  [Background.Sea]: 'assets/backgrounds/sea.webp',
  [Background.Dynamic]: 'assets/backgrounds/dynamic.gif',
  [Background.Dynamic2]: 'assets/backgrounds/dynamic2.gif',
  [Background.Planet]: 'assets/backgrounds/darkPlanet.webp',
  [Background.Tree]: 'assets/backgrounds/tree.webp',
  [Background.Cat]: 'assets/backgrounds/cat.webp',
  [Background.House]: 'assets/backgrounds/house.gif',
  [Background.Waterfall]: 'assets/backgrounds/waterfall.gif',
  [Background.CustomImage]: 'assets/backgrounds/darkPlanet.webp',
  [Background.CustomUrl]: 'assets/backgrounds/darkPlanet.webp',
};

export { backgroundImagesAssets };