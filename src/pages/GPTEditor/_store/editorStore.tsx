import { create } from 'zustand';

const useEditorStore = create((set, get) => ({
  zoom: 10, // px per second
  setZoom: (val) => set({ zoom: val }),

  assets: [],
  addAsset: (asset) =>
    set((state) => ({
      assets: [...state.assets, asset],
    })),

  timelineTracks: {
    video: [
      { id: 'video-track-1', clips: [] }
    ],
    audio: [
      { id: 'audio-track-1', clips: [] }
    ],
  },

  currentTime: 0,
  setCurrentTime: (time) => set({ currentTime: Number(time) || 0 }),

  history: [],
  historyIndex: -1,

  updateState: (updater) =>
    set((state) => {
      const newState = typeof updater === 'function' ? updater(state) : updater;
      const history = [
        ...state.history.slice(0, state.historyIndex + 1),
        newState,
      ];
      return { ...newState, history, historyIndex: history.length - 1 };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state.history[newIndex],
        history: state.history,
        historyIndex: newIndex,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state.history[newIndex],
        history: state.history,
        historyIndex: newIndex,
      };
    }),

  addTrack: (trackType) =>
    get().updateState((state) => {
      const existingTracks = state.timelineTracks[trackType];
      if (!existingTracks) return state;

      const trackCount = existingTracks.length;
      const newTrack = {
        id: `${trackType}-track-${trackCount + 1}`,
        clips: [],
      };

      return {
        timelineTracks: {
          ...state.timelineTracks,
          [trackType]: [...existingTracks, newTrack],
        },
      };
    }),

  removeTrack: (trackType, trackId) =>
    get().updateState((state) => {
      if (state.timelineTracks[trackType].length <= 1) return state;

      return {
        timelineTracks: {
          ...state.timelineTracks,
          [trackType]: state.timelineTracks[trackType].filter(
            (track) => track.id !== trackId,
          ),
        },
      };
    }),

  addToTimeline: (trackType, trackId, clip) =>
    get().updateState((state) => {
      const trackIndex = state.timelineTracks[trackType].findIndex(
        (t) => t.id === trackId,
      );
      if (trackIndex === -1) return state;

      const track = state.timelineTracks[trackType][trackIndex];

      // Find the end time of the last clip in the track
      const lastClipEndTime = track.clips.reduce(
        (max, c) => Math.max(max, c.startTime + c.duration),
        0,
      );

      // Auto-append the clip after the last one
      const startTime =
        clip.hasOwnProperty('startTime') && clip.startTime !== undefined
          ? clip.startTime // If explicitly set, use provided startTime
          : lastClipEndTime; // Otherwise append to the end

      const newClip = {
        ...clip,
        id: Math.random().toString(36).substr(2, 9),
        startTime,
      };

      const updatedTracks = [...state.timelineTracks[trackType]];
      updatedTracks[trackIndex] = {
        ...updatedTracks[trackIndex],
        clips: [...updatedTracks[trackIndex].clips, newClip],
      };

      // Sort clips by startTime to ensure proper order
      updatedTracks[trackIndex].clips.sort((a, b) => a.startTime - b.startTime);

      return {
        timelineTracks: {
          ...state.timelineTracks,
          [trackType]: updatedTracks,
        },
      };
    }),

  // Add a function to prevent overlaps when moving clips
  preventOverlap: (trackType, trackId, clips) => {
    const newClips = [...clips];

    // Sort by startTime
    newClips.sort((a, b) => a.startTime - b.startTime);

    // Adjust positions to prevent overlaps
    for (let i = 1; i < newClips.length; i++) {
      const prevClip = newClips[i - 1];
      const currentClip = newClips[i];

      const prevEndTime = prevClip.startTime + prevClip.duration;

      if (currentClip.startTime < prevEndTime) {
        // Overlap detected, move current clip to start after previous clip
        currentClip.startTime = prevEndTime;
      }
    }

    return newClips;
  },



  deleteClip: (trackType, trackId, clipIndex) =>
    get().updateState((state) => {
      const trackIndex = state.timelineTracks[trackType].findIndex(
        (t) => t.id === trackId,
      );
      if (trackIndex === -1) return state;

      const updatedTracks = [...state.timelineTracks[trackType]];
      const updatedClips = [...updatedTracks[trackIndex].clips];
      updatedClips.splice(clipIndex, 1);

      updatedTracks[trackIndex] = {
        ...updatedTracks[trackIndex],
        clips: updatedClips,
      };

      return {
        timelineTracks: {
          ...state.timelineTracks,
          [trackType]: updatedTracks,
        },
      };
    }),

  updateClip: (trackType, trackId, clipIndex, updates) =>
    get().updateState((state) => {
      const trackIndex = state.timelineTracks[trackType].findIndex(
        (t) => t.id === trackId,
      );
      if (trackIndex === -1) return state;

      const updatedTracks = [...state.timelineTracks[trackType]];
      const updatedClips = [...updatedTracks[trackIndex].clips];
      updatedClips[clipIndex] = { ...updatedClips[clipIndex], ...updates };

      updatedTracks[trackIndex] = {
        ...updatedTracks[trackIndex],
        clips: updatedClips,
      };

      return {
        timelineTracks: {
          ...state.timelineTracks,
          [trackType]: updatedTracks,
        },
      };
    }),

  splitClip: (trackType, trackId, clipIndex) =>
    get().updateState((state) => {
      const trackIndex = state.timelineTracks[trackType].findIndex(
        (t) => t.id === trackId,
      );
      if (trackIndex === -1) return state;

      const track = state.timelineTracks[trackType][trackIndex];
      const clip = track.clips[clipIndex];
      const currentTime = state.currentTime;

      if (
        currentTime <= clip.startTime ||
        currentTime >= clip.startTime + clip.duration
      ) {
        return state;
      }

      const relativePosition = currentTime - clip.startTime;

      const firstClip = {
        ...clip,
        id: Math.random().toString(36).substr(2, 9),
        name: `${clip.name} (1)`,
        duration: relativePosition,
      };

      const secondClip = {
        ...clip,
        id: Math.random().toString(36).substr(2, 9),
        name: `${clip.name} (2)`,
        startTime: currentTime,
        duration: clip.duration - relativePosition,
        mediaOffset: (clip.mediaOffset || 0) + relativePosition,
      };

      const updatedClips = [...track.clips];
      updatedClips.splice(clipIndex, 1, firstClip, secondClip);

      const updatedTracks = [...state.timelineTracks[trackType]];
      updatedTracks[trackIndex] = {
        ...track,
        clips: updatedClips,
      };

      return {
        timelineTracks: {
          ...state.timelineTracks,
          [trackType]: updatedTracks,
        },
      };
    }),

  joinClips: (trackType, trackId, clipIndex) =>
    get().updateState((state) => {
      const trackIndex = state.timelineTracks[trackType].findIndex(
        (t) => t.id === trackId,
      );
      if (
        trackIndex === -1 ||
        clipIndex >=
          state.timelineTracks[trackType][trackIndex].clips.length - 1
      )
        return state;

      const clips = [...state.timelineTracks[trackType][trackIndex].clips];
      const currentClip = clips[clipIndex];
      const nextClip = clips[clipIndex + 1];

      if (
        currentClip.url !== nextClip.url ||
        currentClip.startTime + currentClip.duration !== nextClip.startTime
      ) {
        return state;
      }

      const joinedClip = {
        ...currentClip,
        duration: currentClip.duration + nextClip.duration,
        name: `${currentClip.name} (joined)`,
      };

      clips.splice(clipIndex, 2, joinedClip);
      const updatedTracks = [...state.timelineTracks[trackType]];
      updatedTracks[trackIndex] = { ...updatedTracks[trackIndex], clips };

      return {
        timelineTracks: {
          ...state.timelineTracks,
          [trackType]: updatedTracks,
        },
      };
    }),

  moveClipToTrack: (
    sourceType,
    sourceTrackId,
    clipIndex,
    targetType,
    targetTrackId,
    newStartTime,
  ) =>
    get().updateState((state) => {
      // Find source track
      const sourceTrackIndex = state.timelineTracks[sourceType].findIndex(
        (t) => t.id === sourceTrackId,
      );
      if (sourceTrackIndex === -1) return state;

      // Find target track
      const targetTrackIndex = state.timelineTracks[targetType].findIndex(
        (t) => t.id === targetTrackId,
      );
      if (targetTrackIndex === -1) return state;

      // Get clip to move
      const sourceTrack = state.timelineTracks[sourceType][sourceTrackIndex];
      if (clipIndex < 0 || clipIndex >= sourceTrack.clips.length) return state;

      const clipToMove = { ...sourceTrack.clips[clipIndex] };

      // Remove from source track
      const updatedSourceClips = [...sourceTrack.clips];
      updatedSourceClips.splice(clipIndex, 1);

      // Add to target track with new start time
      clipToMove.startTime = Math.max(0, newStartTime);

      const targetTrack = state.timelineTracks[targetType][targetTrackIndex];
      const updatedTargetClips = [...targetTrack.clips, clipToMove].sort(
        (a, b) => a.startTime - b.startTime,
      );

      // Create updated tracks
      const updatedSourceTracks = [...state.timelineTracks[sourceType]];
      updatedSourceTracks[sourceTrackIndex] = {
        ...sourceTrack,
        clips: updatedSourceClips,
      };

      const updatedTargetTracks = [...state.timelineTracks[targetType]];
      updatedTargetTracks[targetTrackIndex] = {
        ...targetTrack,
        clips: updatedTargetClips,
      };

      return {
        timelineTracks: {
          ...state.timelineTracks,
          [sourceType]: updatedSourceTracks,
          [targetType]: updatedTargetTracks,
        },
      };
    }),


  // Duplicate track with all its clips
  duplicateTrack: (trackType, trackId) =>
    get().updateState((state) => {
      const trackIndex = state.timelineTracks[trackType].findIndex(
        (t) => t.id === trackId,
      );
      if (trackIndex === -1) return state;

      const trackToDuplicate = state.timelineTracks[trackType][trackIndex];

      // Create new track ID
      const newTrackId = Math.random().toString(36).substr(2, 9);

      // Duplicate all clips with new IDs
      const duplicatedClips = trackToDuplicate.clips.map((clip) => ({
        ...clip,
        id: Math.random().toString(36).substr(2, 9),
      }));

      // Create new track
      const newTrack = {
        id: newTrackId,
        clips: duplicatedClips,
      };

      // Add to tracks
      const updatedTracks = [...state.timelineTracks[trackType], newTrack];

      return {
        timelineTracks: {
          ...state.timelineTracks,
          [trackType]: updatedTracks,
        },
      };
    }),

  // Export timeline to JSON
  exportTimeline: () => {
    const state = get();

    const timeline = {
      tracks: state.timelineTracks,
      totalDuration: 0,
    };

    // Calculate total duration
    Object.keys(state.timelineTracks).forEach((type) => {
      state.timelineTracks[type].forEach((track) => {
        track.clips.forEach((clip) => {
          const clipEnd = clip.startTime + clip.duration;
          if (clipEnd > timeline.totalDuration) {
            timeline.totalDuration = clipEnd;
          }
        });
      });
    });

    // Convert to JSON
    const jsonData = JSON.stringify(timeline, null, 2);

    // Create download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-export-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return jsonData;
  },

  // Import timeline from JSON
  importTimeline: (jsonData) =>
    get().updateState((state) => {
      try {
        const imported = JSON.parse(jsonData);

        if (!imported.tracks) {
          console.error('Invalid timeline format');
          return state;
        }

        return {
          timelineTracks: imported.tracks,
        };
      } catch (error) {
        console.error('Failed to import timeline:', error);
        return state;
      }
    }),

  findActiveClip: (type) => {
    const time = get().currentTime;
    const tracks = get().timelineTracks[type] || [];
    const activeClips = [];

    for (const track of tracks) {
      for (const clip of track.clips) {
        if (time >= clip.startTime && time < clip.startTime + clip.duration) {
          activeClips.push(clip);
        }
      }
    }

    if (type === 'video') {
      return activeClips.length > 0
        ? activeClips[activeClips.length - 1]
        : null;
    } else {
      return activeClips.length > 0 ? activeClips : [];
    }
  },

  serializeProject: () => {
    const state = get();
    return {
      assets: state.assets.map(({ file, ...asset }) => asset),
      timelineTracks: state.timelineTracks,
      zoom: state.zoom,
      currentTime: state.currentTime,
    };
  },
}));

export default useEditorStore;
