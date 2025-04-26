
import { create } from 'zustand';

const useEditorStore = create((set, get) => ({
  zoom: 10, // px per second
  setZoom: (val) => set({ zoom: val }),

  assets: [],
  addAsset: (asset) => set((state) => ({
    assets: [...state.assets, asset]
  })),

  timelineTracks: {
    video: [
      { id: 'video-track-1', clips: [] },
      { id: 'video-track-2', clips: [] },
    ],
    audio: [
      { id: 'audio-track-1', clips: [] },
      { id: 'audio-track-2', clips: [] },
    ],
  },

  currentTime: 0,
  setCurrentTime: (time) => set({ currentTime: Number(time) || 0 }),

  history: [],
  historyIndex: -1,

  updateState: (updater) => set((state) => {
    const newState = typeof updater === 'function' ? updater(state) : updater;
    const history = [...state.history.slice(0, state.historyIndex + 1), newState];
    return { ...newState, history, historyIndex: history.length - 1 };
  }),

  undo: () => set((state) => {
    if (state.historyIndex <= 0) return state;
    const newIndex = state.historyIndex - 1;
    return { ...state.history[newIndex], history: state.history, historyIndex: newIndex };
  }),

  redo: () => set((state) => {
    if (state.historyIndex >= state.history.length - 1) return state;
    const newIndex = state.historyIndex + 1;
    return { ...state.history[newIndex], history: state.history, historyIndex: newIndex };
  }),

  addTrack: (trackType) => get().updateState((state) => {
    const existingTracks = state.timelineTracks[trackType];
    if (!existingTracks) return state;

    const trackCount = existingTracks.length;
    const newTrack = {
      id: `${trackType}-track-${trackCount + 1}`,
      clips: []
    };

    return {
      timelineTracks: {
        ...state.timelineTracks,
        [trackType]: [...existingTracks, newTrack]
      }
    };
  }),

  removeTrack: (trackType, trackId) => get().updateState((state) => {
    if (state.timelineTracks[trackType].length <= 1) return state;

    return {
      timelineTracks: {
        ...state.timelineTracks,
        [trackType]: state.timelineTracks[trackType].filter(track => track.id !== trackId)
      }
    };
  }),

  addToTimeline: (trackType, trackId, clip) => get().updateState((state) => {
    const trackIndex = state.timelineTracks[trackType].findIndex(t => t.id === trackId);
    if (trackIndex === -1) return state;

    const startTime = clip.startTime !== undefined ? clip.startTime : get().currentTime;

    const newClip = {
      ...clip,
      id: Math.random().toString(36).substr(2, 9),
      startTime,
    };

    const updatedTracks = [...state.timelineTracks[trackType]];
    updatedTracks[trackIndex] = {
      ...updatedTracks[trackIndex],
      clips: [...updatedTracks[trackIndex].clips, newClip]
    };

    return {
      timelineTracks: {
        ...state.timelineTracks,
        [trackType]: updatedTracks
      }
    };
  }),

  checkerboardClips: (trackType, trackId, clips, startTime = 0, gap = 0) => get().updateState((state) => {
    const trackIndex = state.timelineTracks[trackType].findIndex(t => t.id === trackId);
    if (trackIndex === -1) return state;

    let currentStartTime = startTime;
    const newClips = clips.map((clip) => {
      const newClip = {
        ...clip,
        id: Math.random().toString(36).substr(2, 9),
        startTime: currentStartTime,
      };
      currentStartTime += clip.duration + gap;
      return newClip;
    });

    const updatedTracks = [...state.timelineTracks[trackType]];
    updatedTracks[trackIndex] = {
      ...updatedTracks[trackIndex],
      clips: [...updatedTracks[trackIndex].clips, ...newClips]
    };

    return {
      timelineTracks: {
        ...state.timelineTracks,
        [trackType]: updatedTracks
      }
    };
  }),

  deleteClip: (trackType, trackId, clipIndex) => get().updateState((state) => {
    const trackIndex = state.timelineTracks[trackType].findIndex(t => t.id === trackId);
    if (trackIndex === -1) return state;

    const updatedTracks = [...state.timelineTracks[trackType]];
    const updatedClips = [...updatedTracks[trackIndex].clips];
    updatedClips.splice(clipIndex, 1);

    updatedTracks[trackIndex] = {
      ...updatedTracks[trackIndex],
      clips: updatedClips
    };

    return {
      timelineTracks: {
        ...state.timelineTracks,
        [trackType]: updatedTracks
      }
    };
  }),

  splitClip: (trackType, trackId, clipIndex) => get().updateState((state) => {
    const trackIndex = state.timelineTracks[trackType].findIndex(t => t.id === trackId);
    if (trackIndex === -1) return state;

    const track = state.timelineTracks[trackType][trackIndex];
    const clip = track.clips[clipIndex];
    const currentTime = state.currentTime;

    if (currentTime <= clip.startTime || currentTime >= (clip.startTime + clip.duration)) {
      return state;
    }

    const relativePosition = currentTime - clip.startTime;

    const firstClip = {
      ...clip,
      id: Math.random().toString(36).substr(2, 9),
      name: `${clip.name} (1)`,
      duration: relativePosition
    };

    const secondClip = {
      ...clip,
      id: Math.random().toString(36).substr(2, 9),
      name: `${clip.name} (2)`,
      startTime: currentTime,
      duration: clip.duration - relativePosition,
      mediaOffset: (clip.mediaOffset || 0) + relativePosition
    };

    const updatedClips = [...track.clips];
    updatedClips.splice(clipIndex, 1, firstClip, secondClip);

    const updatedTracks = [...state.timelineTracks[trackType]];
    updatedTracks[trackIndex] = {
      ...track,
      clips: updatedClips
    };

    return {
      timelineTracks: {
        ...state.timelineTracks,
        [trackType]: updatedTracks
      }
    };
  }),

  joinClips: (trackType, trackId, clipIndex) => get().updateState((state) => {
    const trackIndex = state.timelineTracks[trackType].findIndex(t => t.id === trackId);
    if (trackIndex === -1 || clipIndex >= state.timelineTracks[trackType][trackIndex].clips.length - 1) return state;

    const clips = [...state.timelineTracks[trackType][trackIndex].clips];
    const currentClip = clips[clipIndex];
    const nextClip = clips[clipIndex + 1];

    if (currentClip.url !== nextClip.url || currentClip.startTime + currentClip.duration !== nextClip.startTime) {
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
        [trackType]: updatedTracks
      }
    };
  }),

  moveClip: (trackType, trackId, clipIndex, newStartTime) => get().updateState((state) => {
    const snapToGrid = (time) => Math.round(time * 10) / 10;
    const snappedTime = snapToGrid(newStartTime);

    const trackIndex = state.timelineTracks[trackType].findIndex(t => t.id === trackId);
    if (trackIndex === -1) return state;

    const updatedTracks = [...state.timelineTracks[trackType]];
    const updatedClips = [...updatedTracks[trackIndex].clips];
    updatedClips[clipIndex] = { ...updatedClips[clipIndex], startTime: snappedTime };

    updatedTracks[trackIndex] = { ...updatedTracks[trackIndex], clips: updatedClips };

    return {
      timelineTracks: {
        ...state.timelineTracks,
        [trackType]: updatedTracks
      }
    };
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
      // Return the last clip (topmost) for video
      return activeClips.length > 0 ? activeClips[activeClips.length - 1] : null;
    } else {
      // Return all active clips for audio (for mixing)
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