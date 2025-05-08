import { Link } from 'react-router-dom';
import Logo from '../../../images/logo/coat.png';

// src/components/Header.jsx
const RecHeader = ({
  isRecording,
  handleStartRecording,
  handleStopRecording,
  isUploading,
  
}) => {
  return (
    <header className="bg-primary text-white p-3 flex justify-between items-center">
      {/* Left Section: Logo and course info */}
      <div className="flex items-center space-x-4">
        <Link to={'/dashboard'}>
          <img className="h-10" src={Logo} alt="Logo" />
        </Link>

        <div className="flex items-center space-x-1">
          <div className="font-bold text-lg text-black">HTML / </div>
          <p className="text-black text-sm">Introduction to HTML</p>
        </div>
   
      </div>

      {/* Middle Section: Timer */}
      <div className="flex items-center space-x-4">
        <button className="bg-bodydark1 text-black p-2 rounded-md shadow-md text-sm">
          02:34 / 03:44
        </button>
      </div>

      {/* Right Section: Record/Stop button */}
      <div className="flex items-center space-x-4">
        {!isRecording ? (
          <button
            className="bg-red-500 text-white p-2 text-sm rounded-md hover:bg-green-700 transition-colors"
            onClick={handleStartRecording}
          >
            Record
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            disabled={isUploading}
            className="bg-red-500 text-white p-2 text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            {isUploading ? 'Saving...' : 'Stop Recording'}
          </button>
        )}
      </div>
    </header>
  );
};

export default RecHeader;
