
import { useEffect, useRef } from 'react';
import useEditorStore from './_store/editorStore';

export default function VideoPreview({ videoRef, audioRef, setDuration }) {
  const { findActiveClip, currentTime, setCurrentTime } = useEditorStore();

  const activeVideoClip = findActiveClip('video');
  const activeAudioClips = findActiveClip('audio');
  const audioRefs = useRef([]);

  useEffect(() => {
    // Sync video playback
    if (videoRef.current) {
      if (activeVideoClip) {
        const clipPosition = currentTime - activeVideoClip.startTime;
        const mediaPosition = clipPosition + (activeVideoClip.mediaOffset || 0);

        if (videoRef.current.src !== activeVideoClip.url) {
          videoRef.current.src = activeVideoClip.url;
          videoRef.current.load();
        }

        if (Math.abs(videoRef.current.currentTime - mediaPosition) > 0.05) {
          videoRef.current.currentTime = mediaPosition;
        }

        videoRef.current.onloadedmetadata = () => {
          setDuration(videoRef.current?.duration || 10);
        };
      } else {
        videoRef.current.src = '';
        videoRef.current.load();
      }
    }

    // Sync audio playback (multiple clips)
    audioRefs.current.forEach((ref, index) => {
      if (ref && activeAudioClips[index]) {
        const clip = activeAudioClips[index];
        const clipPosition = currentTime - clip.startTime;
        const mediaPosition = clipPosition + (clip.mediaOffset || 0);

        if (ref.src !== clip.url) {
          ref.src = clip.url;
          ref.load();
        }

        if (Math.abs(ref.currentTime - mediaPosition) > 0.05) {
          ref.currentTime = mediaPosition;
        }
      } else if (ref) {
        ref.src = '';
        ref.load();
      }
    });

    // Resize audioRefs to match activeAudioClips
    audioRefs.current = audioRefs.current.slice(0, activeAudioClips.length);
    activeAudioClips.forEach((_, index) => {
      if (!audioRefs.current[index]) {
        audioRefs.current[index] = new Audio();
      }
    });
  }, [currentTime, activeVideoClip, activeAudioClips, setDuration]);

  useEffect(() => {
    if (!activeVideoClip && activeAudioClips.length === 0) {
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
        setCurrentTime(Number(earliestTime));
      }
    }
  }, [activeVideoClip, activeAudioClips, currentTime, setCurrentTime]);

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

      <div className="mt-2 text-xs text-gray-300 flex items-center gap-4">
        {activeVideoClip && (
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
            Video: {activeVideoClip.name}
          </span>
        )}
        {activeAudioClips.length > 0 && (
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Audio: {activeAudioClips.map(clip => clip.name).join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}