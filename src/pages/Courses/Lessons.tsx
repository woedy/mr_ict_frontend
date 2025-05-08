import React, { useCallback, useEffect, useState } from 'react';
import userImage from '../../images/user/user-01.png';
import html from '../../images/html.png';

import { Link } from 'react-router-dom';
import {
  baseUrl,
  baseUrlMedia,
  projectID,
  truncateText,
  userID,
  userToken,
} from '../../constants';

const Lessons: React.FC = () => {
  const [generatedCount, setGeneratedCount] = useState(0);
  const [recentGenerated, setRecentGenerated] = useState([]);

  const [loading, setLoading] = useState(false);

  // State for alerts
  const [alert, setAlert] = useState({ message: '', type: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}api/dashboard/?&user_id=${userID}&project_id=${projectID}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${userToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setGeneratedCount(data.data.generated_count);


      console.log('#######################################');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, userToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="grid grid-cols-3 gap-7">
        <div className="col-span-2">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white mb-4 mt-9">
              HTML Course
            </h4>
            {[...Array(10)].map((_, index) => (
              <Link to={'/lesson-page'}>
                <div className="rounded-2xl bg-white shadow-lg dark:bg-boxdark dark:border-strokedark p-3 flex items-center mb-2">
                  {/* Left Side: Square background with Round Image */}
                  <div className="w-15 h-15 bg-primary rounded-xl flex justify-center items-center shadow-lg overflow-hidden">
                    <img
                      src={html}
                      alt="User Photo"
                      className="w-12 h-12 object-contain"
                    />
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col ml-6 space-y-2">
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      Lesson 0{index}
                    </p>
                    <p className="text-base font-medium text-gray-600 dark:text-gray-300">
                      <span className="">Basics of inline CSS</span>
                    </p>
                  </div>

                  {/* Progress Section */}
                  <div className="ml-auto text-center space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      3 assignments
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="col-span-1">
          <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
            About HTML
          </h4>
          <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5 mb-4">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="py-5 px-4 md:px-6 xl:px-7.5">
                <div className="flex justify-between">
                  <h4 className="  dark:text-white">
                    HTML stands for HyperText Markup Language. It’s the standard
                    language used to create and structure content on the web.
                    HTML is made up of various elements or "tags" that define
                    how text, images, links, and other content should be
                    displayed in a web browser.
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Lessons;
