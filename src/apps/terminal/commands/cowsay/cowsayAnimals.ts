import { CowsayAnimal } from '@Apps/terminal/commands/cowsay/cowsayAnimal.enum';
import { getRandom } from '@nameless-os/sdk';

interface CowsayAnimalProps {
  art: string[];
  name: string;
  defaultText: string;
}

const cowsayAnimals: Record<CowsayAnimal, CowsayAnimalProps> = {
  [CowsayAnimal.Cow]: {
    art: [
      "        \\   ^__^",
      "         \\  (oo)\\_______",
      "             (__)\\       )\\/\\",
      "                ||----w |",
      "                ||     ||",
    ],
    name: 'cow',
    defaultText: 'Moo!',
  },
  [CowsayAnimal.Cat]: {
    art: [
      "        \\   /\\_/\\",
      "         \\ ( o.o )",
      "            > ^ <",
    ],
    name: 'cat',
    defaultText: 'Meow!',
  },
  [CowsayAnimal.Ghost]: {
    art: [
      "        \\   .-. ",
      "         \\ (o o)",
      "           | O |",
      "           |   |",
      "           '~~~'",
    ],
    name: 'ghost',
    defaultText: 'Boo!',
  },
  [CowsayAnimal.Sheep]: {
    art: [
      "        \\  __oo__",
      "         \\ (    )\\_______",
      "             ||||\\       )\\/\\",
      "                ||----w |",
      "                ||     ||",
    ],
    name: 'sheep',
    defaultText: 'Baa!',
  },
  [CowsayAnimal.Tux]: {
    art: [
      "        \\    .--.",
      "         \\  |o_o |",
      "            |:_/ |",
      "           //   \\ \\",
      "          (|     | )",
      "         /'\\_   _/`\\",
      "         \\___)=(___/",
    ],
    name: 'tux',
    defaultText: 'Hello from Linux!',
  },
};

function getRandomCowsayAnimal() {
  return getRandom(Object.values(CowsayAnimal)) as CowsayAnimal;
}

function getCowsayAnimalByFlags(flags:  Record<string, string | boolean>): CowsayAnimalProps {
  if (!flags.animal && !flags.a) {
    if (flags.random) {
      return cowsayAnimals[getRandomCowsayAnimal()];
    }
    return cowsayAnimals[CowsayAnimal.Cow];
  }

  const animal = flags.animal || flags.a

  if (typeof animal !== 'string') {
    return cowsayAnimals[CowsayAnimal.Cow];
  }

  if (isCowsayAnimal(animal)) {
    return cowsayAnimals[animal];
  }
  return cowsayAnimals[CowsayAnimal.Cow];
}

function isCowsayAnimal(animal: string): animal is CowsayAnimal {
  return Object.values(cowsayAnimals).some(({ name }) => name === animal);
}

const allCowsayAnimals = Object.values(cowsayAnimals).map(a => a.name).join(', ');

export { cowsayAnimals, getCowsayAnimalByFlags, allCowsayAnimals };
