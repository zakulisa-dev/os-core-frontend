import {
  SoundAPI,
  PlaySoundOptions,
  SoundRegistration,
  SoundId,
  AppInstanceId, Nullable, SoundInstanceId, createSoundInstanceId,
} from '@nameless-os/sdk';
import { v4 as uuidv4 } from 'uuid';

type InternalSoundInstance = {
  audio: HTMLAudioElement;
  soundId: SoundInstanceId;
  appId?: AppInstanceId;
};

export class SoundManager implements SoundAPI {
  private sounds: Map<SoundId, SoundRegistration> = new Map();
  private playing: Map<SoundInstanceId, InternalSoundInstance> = new Map();
  private appVolumes: Map<string, number> = new Map();
  private masterVolume = 1;
  private muted = false;

  play(soundId: SoundId, options?: PlaySoundOptions): Nullable<SoundInstanceId> {
    const reg = this.sounds.get(soundId);
    if (!reg) {
      return null;
    }
    return this.playUrl(reg.url, { ...options, appId: options?.appId as AppInstanceId });
  }

  playUrl(url: string, options?: PlaySoundOptions): SoundInstanceId {
    const audio = new Audio(url);
    const volume = this.getEffectiveVolume(options?.appId, options?.volume);
    audio.volume = this.muted ? 0 : volume;
    if (options?.loop) audio.loop = true;
    if (options?.playbackRate) audio.playbackRate = options.playbackRate;
    if (options?.onEnd) audio.onended = options.onEnd;

    const id = createSoundInstanceId(uuidv4());
    this.playing.set(id, {
      audio,
      soundId: id,
      appId: options?.appId,
    });

    audio.play().catch(console.error);

    return id;
  }

  stop(soundId: string): void {
    for (const [id, instance] of this.playing.entries()) {
      if (id === soundId) {
        instance.audio.pause();
        instance.audio.currentTime = 0;
        this.playing.delete(id);
      }
    }
  }

  stopAll(): void {
    for (const [, instance] of this.playing.entries()) {
      instance.audio.pause();
      instance.audio.currentTime = 0;
    }
    this.playing.clear();
  }

  registerSound(sound: SoundRegistration): void {
    this.sounds.set(sound.soundId, sound);
  }

  unregisterSound(soundId: SoundId): void {
    this.sounds.delete(soundId);
  }

  getRegisteredSounds(): SoundRegistration[] {
    return Array.from(this.sounds.values());
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(volume, 1));
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  setAppVolume(appId: string, volume: number): void {
    this.appVolumes.set(appId, Math.max(0, Math.min(volume, 1)));
  }

  getAppVolume(appId: string): number {
    return this.appVolumes.get(appId) ?? 1;
  }

  mute(): void {
    this.muted = true;
  }

  unmute(): void {
    this.muted = false;
  }

  isMuted(): boolean {
    return this.muted;
  }

  stopAllByApp(appId: AppInstanceId) {
    for (const [id, instance] of this.playing) {
      if (instance.appId === appId) {
        instance.audio.pause();
        instance.audio.currentTime = 0;
        this.playing.delete(id);
      }
    }
  }

  pause(instanceId: SoundInstanceId): void {
    throw new Error('Method not implemented.');
  }
  resume(instanceId: SoundInstanceId): void {
    throw new Error('Method not implemented.');
  }
  stopSound(soundId: SoundId): void {
    throw new Error('Method not implemented.');
  }
  isPlaying(instanceId: SoundInstanceId): boolean {
    throw new Error('Method not implemented.');
  }
  getPlayingInstances(soundId?: SoundId): SoundInstanceId[] {
    throw new Error('Method not implemented.');
  }
  getPlayingInstancesByApp(appId: AppInstanceId): SoundInstanceId[] {
    throw new Error('Method not implemented.');
  }
  setInstanceVolume(instanceId: SoundInstanceId, volume: number): void {
    throw new Error('Method not implemented.');
  }
  getInstanceVolume(instanceId: SoundInstanceId): number {
    throw new Error('Method not implemented.');
  }
  setSoundVolume(soundId: SoundId, volume: number): void {
    throw new Error('Method not implemented.');
  }
  muteApp(appId: AppInstanceId): void {
    throw new Error('Method not implemented.');
  }
  unmuteApp(appId: AppInstanceId): void {
    throw new Error('Method not implemented.');
  }
  isAppMuted(appId: AppInstanceId): boolean {
    throw new Error('Method not implemented.');
  }

  private getEffectiveVolume(appId?: string, localVolume = 1): number {
    const appVolume = appId ? this.getAppVolume(appId) : 1;
    return this.masterVolume * appVolume * localVolume;
  }
}

export type { SoundAPI };
