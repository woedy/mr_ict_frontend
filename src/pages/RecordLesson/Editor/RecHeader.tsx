import { Link } from 'react-router-dom';
import { ChevronRight, Clock, CircleDot, CircleOff } from 'lucide-react';
import Logo from '../../../images/logo/mrict_logo.jpg';

const RecHeader = ({
  isRecording,
  handleStartRecording,
  handleStopRecording,
  isUploading,
}) => {
  return (
    <header className="bg-boxdark shadow-sm flex items-center px-4 py-2 h-16">
      {/* Left Section: Logo and course info */}
      <div className="flex items-center space-x-4 flex-1">
        <Link to="/dashboard">
          <img className="h-10 rounded-md" src={Logo} alt="Logo" />
        </Link>

        <div className="flex items-center text-sm text-gray">
          <span className="font-medium">HTML</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="font-semibold text-gray-200">
            Introduction to HTML
          </span>
        </div>
      </div>

      {/* Center: Timer */}
      <div className="flex items-center mx-4">
        <div className="bg-gray-100 rounded-full px-4 py-1.5 flex items-center">
          <Clock size={16} className="text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            02:34 / 03:44
          </span>
        </div>
      </div>

      {/* Right: Record / Stop */}
      <div className="flex items-center">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md flex items-center gap-2 text-sm transition"
          >
            <CircleDot size={16} />
            Record
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            disabled={isUploading}
            className={`px-4 py-1.5 rounded-md flex items-center gap-2 text-sm transition ${
              isUploading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            <CircleOff size={16} />
            {isUploading ? 'Saving...' : 'Stop Recording'}
          </button>
        )}
      </div>
    </header>
  );
};

export default RecHeader;
