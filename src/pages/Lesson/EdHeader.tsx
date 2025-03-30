import { Link } from 'react-router-dom';
import Logo from '../../images/logo/coat.png';

// src/components/Header.jsx
const EdHeader = () => {
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
        <div className="flex items-center space-x-3">
          <button className="bg-red-600 text-white p-2 text-sm rounded-md hover:bg-red-700 transition-colors">
            Discard
          </button>
          <button className="bg-green text-white p-2 text-sm rounded-md hover:bg-green-700 transition-colors">
            Save
          </button>
        </div>
      </div>

      {/* Middle Section: Timer */}
      <div className="flex items-center space-x-4">
        <button className="bg-bodydark1 text-black p-2 rounded-md shadow-md text-sm">
          02:34 / 03:44
        </button>
      </div>

      {/* Right Section: RUN button */}
      <div className="flex items-center space-x-4">
        <button className="bg-green text-white p-2 text-sm rounded-md hover:bg-green-700 transition-colors">
          RUN
        </button>
      </div>
    </header>
  );
};

export default EdHeader;
