import { useCallback, useEffect, useState } from 'react';
import { useConfig } from 'config';

export const useBells = () => {
  const { featureFlags } = useConfig().externalConfig;
  const [audio, setAudio] = useState<HTMLAudioElement>();

  useEffect(() => {
    if (!featureFlags.holidayDecorEnabled) return;

    const audioInstance = new Audio('/bells.mp3');
    audioInstance.preload = 'auto';
    audioInstance.volume = 0.8;
    audioInstance.load();
    audioInstance.title = 'bells';

    setAudio(audioInstance);
  }, [featureFlags.holidayDecorEnabled]);

  const bells = useCallback(() => {
    if (!featureFlags.holidayDecorEnabled) return;
    if (!audio) {
      console.warn('[useBells] Failed to play sound:', 'audio not loaded');
      return;
    }
    audio.currentTime = 0;
    void audio
      .play()
      .catch((error) =>
        console.warn('[useBells] Failed to play sound:', error),
      );
  }, [audio, featureFlags.holidayDecorEnabled]);

  return { bells };
};
