import { useCallback, useEffect, useState } from 'react';

export const useBells = () => {
  const [audio, setAudio] = useState<HTMLAudioElement>();

  useEffect(() => {
    const audioInstance = new Audio('/bells.mp3');
    audioInstance.preload = 'auto';
    audioInstance.volume = 0.8;
    audioInstance.load();
    audioInstance.title = 'bells';

    setAudio(audioInstance);
  }, []);

  const bells = useCallback(() => {
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
  }, [audio]);

  return { bells };
};
