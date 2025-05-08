// PlaybackControls.tsx
import { useState, useEffect } from 'react';
import useEditorStore from './_store/editorStore';

export default function PlaybackControls({ videoRef, audioRefs, duration }) {
  const { currentTime, setCurrentTime, findActiveClip, splitClip } = useEditorStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handlePlayPause = async () => {
    console.log('handlePlayPause called', {
      isPlaying,
      audioRefs: audioRefs.current,
      activeAudioClips: findActiveClip('audio'),
    });

    if (isPlaying) {
      videoRef.current?.pause();
      audioRefs.current.forEach((ref) => ref?.pause());
      setIsPlaying(false);
    } else {
      const activeVideoClip = findActiveClip('video');
      const activeAudioClips = findActiveClip('audio');

      console.log('Active clips:', { activeVideoClip, activeAudioClips });

      if (!activeVideoClip && !activeAudioClips.length) {
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
          console.log('Setting currentTime to earliest:', earliestTime);
          setCurrentTime(earliestTime);
        }
        return;
      }

      const playPromises = [];
      if (videoRef.current && activeVideoClip && videoRef.current.readyState >= 2) {
        videoRef.current.playbackRate = playbackSpeed;
        playPromises.push(videoRef.current.play().catch((e) => console.warn('Video playback failed:', e)));
      }
      audioRefs.current.forEach((ref, index) => {
        if (ref && activeAudioClips[index] && ref.readyState >= 2) {
          ref.playbackRate = playbackSpeed;
          console.log(`Attempting to play audio ${index}: ${activeAudioClips[index].name}`);
          playPromises.push(
            ref.play().catch((e) => console.warn(`Audio ${index} playback failed:`, e))
          );
        }
      });

      console.log('Play promises:', playPromises);
      await Promise.all(playPromises);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value) || 0;
    setCurrentTime(time);
  };

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
    audioRefs.current.forEach((ref) => {
      if (ref) {
        ref.playbackRate = playbackSpeed;
      }
    });
  }, [playbackSpeed]);

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

  const formatTime = (seconds) => {
    const safeSeconds = Number(seconds) || 0;
    const min = Math.floor(safeSeconds / 60);
    const sec = Math.floor(safeSeconds % 60);
    const ms = Math.floor((safeSeconds % 1) * 10);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms}`;
  };

  const safeCurrentTime = Number(currentTime) || 0;

  return (
    <div className="w-full px-6 py-3 bg-graydark border-t border-gray-700">
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
          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs shrink-0"
        >
          ✂️ Split
        </button>
      </div>
    </div>
  );
}