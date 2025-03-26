import VideoPlayer from "./VideoPlayer";

const videoUrl = 'http://localhost:8000/media/recordings/Screen_Recording_2025-03-26_054122.mp4'; // Adjust your Django video URL here

function App() {
  return (
    <VideoPlayer videoUrl={videoUrl} />  );
}

export default App;
