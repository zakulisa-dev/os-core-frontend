import { createSoundId } from '@nameless-os/sdk';

const ACHIEVEMENT_UNLOCK_SOUND = createSoundId('achievement_unlocked');

const ACHIEVEMENT_UNLOCK_EVENT = 'achievement:unlocked';
const ACHIEVEMENT_REGISTER_EVENT = 'achievement:registered';
const ACHIEVEMENT_PROGRESS_EVENT = 'achievement:progress';
const ACHIEVEMENT_PROGRESS_IMPORTED_EVENT = 'achievement:progress-imported';


export {
  ACHIEVEMENT_UNLOCK_SOUND,
  ACHIEVEMENT_UNLOCK_EVENT,
  ACHIEVEMENT_REGISTER_EVENT,
  ACHIEVEMENT_PROGRESS_EVENT,
  ACHIEVEMENT_PROGRESS_IMPORTED_EVENT,
};
