
import { useState, useEffect } from 'react';
import useEditorStore from './_store/editorStore';

export default function PlaybackControls({ videoRef, audioRef, duration }) {
  const { currentTime, setCurrentTime, findActiveClip, splitClip } = useEditorStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Handle play/pause toggle
  const handlePlayPause = async () => {
    if (isPlaying) {
      videoRef.current?.pause();
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      const activeVideoClip = findActiveClip('video');
      const activeAudioClip = findActiveClip('audio');

      if (!activeVideoClip && !activeAudioClip) {
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
    const time = parseFloat(e.target.value) || 0;
    setCurrentTime(time);
  };

  // Handle split at playhead
  const handleSplit = () => {
    ['video', 'audio'].forEach((type) => {
      const tracks = useEditorStore.getState().timelineTracks[type] || [];
      tracks.forEach((track) => {
        track.clips.forEach((clip, index) => {
          if (currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration) {
            splitClip(type, track.id, index);
          }
        });
      });
    });
  };

  // Continuous playback with requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) return;

    let rafId;
    const update = () => {
      setCurrentTime((time) => {
        const newTime = Number(time) + 0.016 * playbackSpeed;
        if (newTime >= duration || isNaN(newTime)) {
          setIsPlaying(false);
          videoRef.current?.pause();
          audioRef.current?.pause();
          return duration;
        }
        return newTime;
      });
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, duration, setCurrentTime, playbackSpeed]);

  // Sync media elements and playback speed
  useEffect(() => {
    const activeVideoClip = findActiveClip('video');
    const activeAudioClip = findActiveClip('audio');

    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      if (activeVideoClip) {
        const clipPosition = currentTime - activeVideoClip.startTime;
        const mediaPosition = clipPosition + (activeVideoClip.mediaOffset || 0);
        if (Math.abs(videoRef.current.currentTime - mediaPosition) > 0.05) {
          videoRef.current.currentTime = mediaPosition;
        }
      }
    }

    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      if (activeAudioClip) {
        const clipPosition = currentTime - activeAudioClip.startTime;
        const mediaPosition = clipPosition + (activeAudioClip.mediaOffset || 0);
        if (Math.abs(audioRef.current.currentTime - mediaPosition) > 0.05) {
          audioRef.current.currentTime = mediaPosition;
        }
      }
    }
  }, [currentTime, playbackSpeed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        handleSplit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause]);

  // Format time as MM:SS.ms
  const formatTime = (seconds) => {
    const safeSeconds = Number(seconds) || 0;
    const min = Math.floor(safeSeconds / 60);
    const sec = Math.floor(safeSeconds % 60);
    const ms = Math.floor((safeSeconds % 1) * 10);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms}`;
  };

  // Ensure currentTime is a number for the input value
  const safeCurrentTime = Number(currentTime) || 0;

  return (
    <div className="w-full px-6 py-3 bg-gray-800 border-t border-gray-700">
      <div className="flex items-center gap-4 text-white text-sm w-full max-w-[1200px] mx-auto">
        <button
          onClick={handlePlayPause}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm shrink-0"
        >
          {isPlaying ? '⏸ Pause' : '▶️ Play'}
        </button>

        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="bg-gray-600 text-white px-2 py-1 rounded text-xs shrink-0"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
        </select>

        <span className="shrink-0 w-14 text-right font-mono">{formatTime(currentTime)}</span>

        <input
          type="range"
          min={0}
          max={duration}
          step={0.01}
          value={safeCurrentTime}
          onChange={handleSeek}
          className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />

        <span className="shrink-0 w-14 font-mono">{formatTime(duration)}</span>

        <button
          onClick={handleSplit}
          className="bg-yellow-500 text-black px-2 py-1 rounded text-xs shrink-0"
        >
          ✂️ Split
        </button>
      </div>
    </div>
  );
}