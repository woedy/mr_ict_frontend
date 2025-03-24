export const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "always"
      },
      audio: true
    });
    
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    mediaRecorder.start(1000); // Collect data every second
    
    // Return an object with the mediaRecorder and a promise that resolves when recording stops
    return {
      mediaRecorder,
      stream,
      getBlob: () => new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          resolve(blob);
        };
      })
    };
  } catch (err) {
    console.error("Error starting screen recording:", err);
    throw err;
  }
};

export const stopRecording = async (recorderObj) => {
  if (!recorderObj || !recorderObj.mediaRecorder) {
    throw new Error("Invalid recorder object");
  }
  
  recorderObj.mediaRecorder.stop();
  recorderObj.stream.getTracks().forEach(track => track.stop());
  
  // Return the blob when it's ready
  return await recorderObj.getBlob();
};