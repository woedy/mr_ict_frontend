import DropdownMessage from './DropdownMessage';
import DropdownNotification from './DropdownNotification';
import DarkModeSwitcher from './DarkModeSwitcher';
import userImage from '../../images/user/user-01.png';
import student from '../../images/user/student.png';
import gold from '../../images/gold.png';
import badge from '../../images/badge.png';

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white dark:bg-boxdark shadow-xl dark:shadow-none border-b-8 border-primary rounded-xl">
      <div className="flex flex-grow items-center justify-center px-4 py-8 md:px-6 lg:px-10 xl:px-11 min-h-[300px] ">
        <div className="flex gap-8 items-center justify-center max-w-5xl w-full">
          {/* Name Section - Large Welcome Text */}
          <div className="flex-1 min-w-[600px]">
            <p className="text-2xl md:text-3xl font-medium text-gray-600 dark:text-gray-300 tracking-wide">
              Welcome
            </p>
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 dark:text-white mt-3 tracking-tight leading-tight">
              Sandra Aborwu
            </h1>
          </div>

          {/* Stats and Profile Section */}
          <div className="flex gap-6 items-center">
            {/* Stats */}
            <div className="flex-2 text-center">
              <img
                src={gold}
                alt="User Photo"
                className="w-6 h-6 object-cover rounded-full justify-center"
              />
              <p className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white">
                756
              </p>
              <p className="text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-400 mt-1">
                epz
              </p>
            </div>

            {/* Main Profile Image with Bottom Blue Line */}
            <div className="flex-2">
              <div className="h-[180px] w-[180px] md:h-[150px] md:w-[150px] rounded-full overflow-hidden ring-4 ring-blue-100 dark:ring-blue-900/30 shadow-lg border-b-2 border-blue-500">
                <img
                  src={student}
                  alt="User Photo"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4 mt-6">
                <DarkModeSwitcher />
                <DropdownNotification />
                <DropdownMessage />
              </div>
            </div>
          </div>

          {/* Friends Avatars - Horizontal Layout */}
          <div className="w-full">
            <div className="grid grid-cols-6 gap-6 justify-start max-w-full">
              {[...Array(10)].map((_, index) => (
                <div
                  key={index}
                  className="h-[50px] w-[50px] rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-md hover:scale-105 transition-transform duration-200"
                >
                  <img
                    src={badge}
                    alt={`Friend ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
