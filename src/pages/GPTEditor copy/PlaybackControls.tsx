import { useState, useEffect } from 'react';
import useEditorStore from './_store/editorStore';

export default function PlaybackControls({ videoRef, audioRef, duration }) {
  const { currentTime, setCurrentTime, findActiveClip } = useEditorStore();
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle play/pause toggle
  const handlePlayPause = async () => {
    if (isPlaying) {
      videoRef.current?.pause();
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Ensure media is ready
      const activeVideoClip = findActiveClip('video');
      const activeAudioClip = findActiveClip('audio');

      if (!activeVideoClip && !activeAudioClip) {
        // No clips to play, seek to earliest clip
        let earliestTime = Infinity;
        ['video', 'audio'].forEach((type) => {
          const tracks = useEditorStore.getState().timelineTracks[type] || [];
          tracks.forEach((track) => {
            track.clips.forEach((clip) => {
              if (clip.startTime < earliestTime) {
                earliestTime = clip.startTime;
              }
            });
          });
        });
        if (earliestTime !== Infinity) {
          setCurrentTime(earliestTime);
        }
        return;
      }

      const playPromises = [];
      if (videoRef.current && activeVideoClip && videoRef.current.readyState >= 2) {
        playPromises.push(videoRef.current.play().catch((e) => console.warn('Video playback failed:', e)));
      }
      if (audioRef.current && activeAudioClip && audioRef.current.readyState >= 2) {
        playPromises.push(audioRef.current.play().catch((e) => console.warn('Audio playback failed:', e)));
      }

      await Promise.all(playPromises);
      setIsPlaying(true);
    }
  };

  // Handle seeking
  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
  };

  // Continuous playback
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((time) => {
        if (time >= duration) {
          setIsPlaying(false);
          videoRef.current?.pause();
          audioRef.current?.pause();
          return duration;
        }
        return time + 0.03;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isPlaying, duration, setCurrentTime]);

  // Sync media elements when currentTime changes
  useEffect(() => {
    const activeVideoClip = findActiveClip('video');
    const activeAudioClip = findActiveClip('audio');

    if (videoRef.current && activeVideoClip) {
      const clipPosition = currentTime - activeVideoClip.startTime;
      const mediaPosition = clipPosition + (activeVideoClip.mediaOffset || 0);
      if (Math.abs(videoRef.current.currentTime - mediaPosition) > 0.05) {
        videoRef.current.currentTime = mediaPosition;
      }
    }

    if (audioRef.current && activeAudioClip) {
      const clipPosition = currentTime - activeAudioClip.startTime;
      const mediaPosition = clipPosition + (activeAudioClip.mediaOffset || 0);
      if (Math.abs(audioRef.current.currentTime - mediaPosition) > 0.05) {
        audioRef.current.currentTime = mediaPosition;
      }
    }
  }, [currentTime]);

  // Format time as MM:SS.ms
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="w-full px-6 py-3 bg-gray-800 border-t border-gray-700">
      <div className="flex items-center gap-4 text-white text-sm w-full max-w-[1200px] mx-auto">
        <button
          onClick={handlePlayPause}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm shrink-0"
        >
          {isPlaying ? '⏸ Pause' : '▶️ Play'}
        </button>

        <span className="shrink-0 w-14 text-right font-mono">{formatTime(currentTime)}</span>

        <input
          type="range"
          min={0}
          max={duration}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />

        <span className="shrink-0 w-14 font-mono">{formatTime(duration)}</span>

        <button className="bg-yellow-500 text-black px-2 py-1 rounded text-xs shrink-0">✂️ Split at Playhead</button>
      </div>
    </div>
  );
}