import { useEffect } from 'react';
import useEditorStore from './_store/editorStore';

export default function VideoPreview({ videoRef, audioRef, setDuration }) {
  const { findActiveClip, currentTime, setCurrentTime } = useEditorStore();

  const activeVideoClip = findActiveClip('video');
  const activeAudioClip = findActiveClip('audio');

  useEffect(() => {
    // Sync video playback
    if (videoRef.current) {
      if (activeVideoClip) {
        const clipPosition = currentTime - activeVideoClip.startTime;
        const mediaPosition = clipPosition + (activeVideoClip.mediaOffset || 0);

        // Update source if different
        if (videoRef.current.src !== activeVideoClip.url) {
          videoRef.current.src = activeVideoClip.url;
          videoRef.current.load();
        }

        // Only update time if significantly different to avoid flicker
        if (Math.abs(videoRef.current.currentTime - mediaPosition) > 0.05) {
          videoRef.current.currentTime = mediaPosition;
        }

        // Update duration when metadata is loaded
        videoRef.current.onloadedmetadata = () => {
          setDuration(videoRef.current?.duration || 10);
        };
      } else {
        videoRef.current.src = '';
        videoRef.current.load();
      }
    }

    // Sync audio playback
    if (audioRef.current) {
      if (activeAudioClip) {
        const clipPosition = currentTime - activeAudioClip.startTime;
        const mediaPosition = clipPosition + (activeAudioClip.mediaOffset || 0);

        if (audioRef.current.src !== activeAudioClip.url) {
          audioRef.current.src = activeAudioClip.url;
          audioRef.current.load();
        }

        if (Math.abs(audioRef.current.currentTime - mediaPosition) > 0.05) {
          audioRef.current.currentTime = mediaPosition;
        }
      } else {
        audioRef.current.src = '';
        audioRef.current.load();
      }
    }
  }, [currentTime, activeVideoClip, activeAudioClip, setDuration]);

  // Auto-seek to first clip when no clip is active
  useEffect(() => {
    if (!activeVideoClip && !activeAudioClip) {
      // Find the earliest clip
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

      if (earliestTime !== Infinity && currentTime !== earliestTime) {
        setCurrentTime(earliestTime);
      }
    }
  }, [activeVideoClip, activeAudioClip, currentTime, setCurrentTime]);

  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center p-4 text-white">
      <div className="relative w-full max-w-[960px] aspect-video bg-black rounded overflow-hidden shadow">
        {activeVideoClip ? (
          <video
            ref={videoRef}
            className="absolute w-full h-full object-contain"
            controls={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No video at current position</p>
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        className="hidden"
        controls={false}
      />

      <div className="mt-2 text-xs text-gray-300 flex items-center gap-4">
        {activeVideoClip && (
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
            Video: {activeVideoClip.name}
          </span>
        )}
        {activeAudioClip && (
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Audio: {activeAudioClip.name}
          </span>
        )}
      </div>
    </div>
  );
}