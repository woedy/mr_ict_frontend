// First, let's update the editorStore to support multiple tracks for each media type

import { create } from 'zustand';

const useEditorStore = create((set, get) => ({
  zoom: 10, // px per second
  setZoom: (val) => set({ zoom: val }),

  assets: [],

  addAsset: (asset) => set((state) => ({
    assets: [...state.assets, asset]
  })),
  
  // Redesigned timeline structure to support multiple tracks
  timelineTracks: {
    video: [
      { id: 'video-track-1', clips: [] },  // First video track
      { id: 'video-track-2', clips: [] },  // Second video track
    ],
    audio: [
      { id: 'audio-track-1', clips: [] },  // First audio track
      { id: 'audio-track-2', clips: [] },  // Second audio track
    ],
  },
  
  currentTime: 0,
  setCurrentTime: (time) => set({ currentTime: time }),

  // Add a new track of specified type
  addTrack: (trackType) => set((state) => {
    const existingTracks = state.timelineTracks[trackType];
    if (!existingTracks) {
      console.error(`Unknown trackType: ${trackType}`);
      return state;
    }
  
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
  


  // Remove a track with the specified ID
  removeTrack: (trackType, trackId) => set((state) => {
    // Don't allow removing the last track
    if (state.timelineTracks[trackType].length <= 1) {
      return state;
    }
    
    return {
      timelineTracks: {
        ...state.timelineTracks,
        [trackType]: state.timelineTracks[trackType].filter(track => track.id !== trackId)
      }
    };
  }),


  // Updated method to add clip to a specific track
  addToTimeline: (trackType, trackId, clip) => set((state) => {
    const trackIndex = state.timelineTracks[trackType].findIndex(t => t.id === trackId);
    if (trackIndex === -1) return state;
  
    // Use 0 as startTime for the first clip or if currentTime is not set
    const isFirstClip = state.timelineTracks[trackType][trackIndex].clips.length === 0;
    const startTime = isFirstClip ? 0 : get().currentTime;
  
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
  // Updated to delete a clip from a specific track
  deleteClip: (trackType, trackId, clipIndex) => set((state) => {
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

  // Split a clip in a specific track
  splitClip: (trackType, trackId, clipIndex) => set((state) => {
    const trackIndex = state.timelineTracks[trackType].findIndex(t => t.id === trackId);
    if (trackIndex === -1) return state;
    
    const track = state.timelineTracks[trackType][trackIndex];
    const clip = track.clips[clipIndex];
    const currentTime = state.currentTime;
    
    // Only split if playhead is within clip bounds
    if (currentTime <= clip.startTime || currentTime >= (clip.startTime + clip.duration)) {
      return state; // Playhead not in clip range
    }
    
    // Calculate split position
    const relativePosition = currentTime - clip.startTime;
    
    // Create the two new clips
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
    
    // Create updated clips array
    const updatedClips = [...track.clips];
    updatedClips.splice(clipIndex, 1, firstClip, secondClip);
    
    // Update the track
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
  
  // Find active clip at current time

  findActiveClip: (type) => {
    const time = get().currentTime;
    const tracks = get().timelineTracks[type] || [];
    for (const track of tracks) {
      for (const clip of track.clips) {
        if (time >= clip.startTime && time < clip.startTime + clip.duration) {
          return clip;
        }
      }
    }
    return null;
  },
  
}));

export default useEditorStore;