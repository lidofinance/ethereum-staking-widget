import { useCallback, useEffect, useState } from 'react';

export const useHonk = () => {
  const [audio, setAudio] = useState<HTMLAudioElement>();

  useEffect(() => {
    const audioInstance = new Audio('/honk.mp3');
    audioInstance.preload = 'auto';
    audioInstance.volume = 0.8;
    audioInstance.load();
    audioInstance.title = 'honk';

    setAudio(audioInstance);
  }, []);

  const honk = useCallback(() => {
    if (!audio) {
      console.warn('[useHonk] Failed to play sound:', 'audio not loaded');
      return;
    }
    audio.currentTime = 0;
    void audio
      .play()
      .catch((error) => console.warn('[useHonk] Failed to play sound:', error));
  }, [audio]);

  return { honk };
};
