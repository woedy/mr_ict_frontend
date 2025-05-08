import { useState } from 'react';
import { ChevronRight, Clock, Play, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../../../images/logo/mrict_logo.jpg';

const TuHeader = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <header className="bg-boxdark shadow-sm flex items-center px-4 py-2 h-16">
      {/* Left Section: Logo and course info */}
      <div className="flex items-center space-x-4 flex-1">
        <Link to={'/dashboard'}>
          <img className="h-10 rounded-md" src={Logo} alt="Logo" />
        </Link>

        <div className="flex items-center text-sm text-gray">
          <span className="font-medium">HTML</span>
          <ChevronRight size={16} className="mx-1" />
          <span className="font-semibold text-gray-800">
            Introduction to HTML
          </span>
        </div>
      </div>

      {/* Middle Section: Timer */}
      <div className="flex items-center mx-4">
        <div className="bg-gray-100 rounded-full px-4 py-1.5 flex items-center">
          <Clock size={16} className="text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            02:34 / 03:44
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 mr-4">
        <button className="px-3 py-1.5 text-sm text-gray bg-red-500 hover:text-gray-800 rounded-md hover:bg-gray-100 transition flex items-center gap-1">
          <X size={16} />
          Discard
        </button>

        <button
          onClick={handleSave}
          className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 transition ${
            saved
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      {/* Right Section: RUN button */}
      <div className="flex items-center">
        <button className="bg-green hover:bg-green-700 text-white px-5 py-1.5 rounded-md transition flex items-center gap-1 font-medium">
          <Play size={16} fill="white" />
          RUN
        </button>
      </div>
    </header>
  );
};

export default TuHeader;
