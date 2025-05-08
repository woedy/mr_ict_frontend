import React, { useCallback, useEffect, useState } from 'react';
import html from '../../images/html.png';
import css from '../../images/css.png';
import python from '../../images/python.png';
import javascript from '../../images/javascript.png';

import { Link } from 'react-router-dom';
import {
  baseUrl,
  baseUrlMedia,
  projectID,
  truncateText,
  userID,
  userToken,
} from '../../constants';

const CourseChallenges: React.FC = () => {
  const [generatedCount, setGeneratedCount] = useState(0);
  const [recentGenerated, setRecentGenerated] = useState([]);

  const [loading, setLoading] = useState(false);

  // State for alerts
  const [alert, setAlert] = useState({ message: '', type: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}api/course/?&user_id=${userID}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${userToken}`,
        },
      });

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
             Course Challenges
            </h4>

            <div className="grid grid-cols-2 gap-5">
              <Link to="/challenges">
                <div className="rounded-2xl bg-white shadow-lg dark:bg-boxdark dark:border-strokedark p-5 flex items-center">
                  {/* Left Side: Square background with Round Image */}
                  <div className="w-20 h-20 bg-primary rounded-xl flex justify-center items-center shadow-lg overflow-hidden">
                    <img
                      src={html}
                      alt="User Photo"
                      className="w-16 h-16 object-contain"
                    />
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col ml-6 space-y-2">
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      HTML
                    </p>
                    <p className="">The language for building web pages</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      50 Challenges
                    </p>
                  </div>
                </div>
              </Link>

              <div className="rounded-2xl bg-white shadow-lg dark:bg-boxdark dark:border-strokedark p-5 flex items-center">
                {/* Left Side: Square background with Round Image */}
                <div className="w-20 h-20 bg-primary rounded-xl flex justify-center items-center shadow-lg overflow-hidden">
                  <img
                    src={css}
                    alt="User Photo"
                    className="w-16 h-16 object-contain"
                  />
                </div>

                {/* Content Section */}
                <div className="flex flex-col ml-6 space-y-2">
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    CSS
                  </p>
                  <p className="">The language for building web pages</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    50 Challenges
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white shadow-lg dark:bg-boxdark dark:border-strokedark p-5 flex items-center">
                {/* Left Side: Square background with Round Image */}
                <div className="w-20 h-20 bg-primary rounded-xl flex justify-center items-center shadow-lg overflow-hidden">
                  <img
                    src={javascript}
                    alt="User Photo"
                    className="w-16 h-16 object-contain"
                  />
                </div>

                {/* Content Section */}
                <div className="flex flex-col ml-6 space-y-2">
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    JAVASCRIPT
                  </p>
                  <p className="">The language for building web pages</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    50 Challenges
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white shadow-lg dark:bg-boxdark dark:border-strokedark p-5 flex items-center">
                {/* Left Side: Square background with Round Image */}
                <div className="w-20 h-20 bg-primary rounded-xl flex justify-center items-center shadow-lg overflow-hidden">
                  <img
                    src={python}
                    alt="User Photo"
                    className="w-16 h-16 object-contain"
                  />
                </div>

                {/* Content Section */}
                <div className="flex flex-col ml-6 space-y-2">
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    PTYHON
                  </p>
                  <p className="">The language for building web pages</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    50 Challenges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseChallenges;
