import React, { useCallback, useEffect, useRef, useState } from 'react';
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

const RecordedCourseLessons: React.FC = () => {
  const [generatedCount, setGeneratedCount] = useState(0);
  const [recentValidated, setRecentValidated] = useState([]);


  const [loading, setLoading] = useState(false);

  // State for alerts
  const [alert, setAlert] = useState({ message: '', type: '' });


  //GET DATA FROM SERVER /////

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
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h4 className="text-2xl font-semibold text-black dark:text-black mb-8">
          HTML Course
        </h4>
        <Link to={'/record-lesson-page'} >
        
        <button className="bg-green text-white p-2 text-sm rounded-md hover:bg-green-700 transition-colors mb-5">
          Add Tutorial
        </button>
        </Link>
  
  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(10)].map((_, index) => (
            <Link to="/record-player" key={index}>
              <div className="rounded-2xl bg-white shadow-lg dark:bg-boxdark dark:border-strokedark p-4 flex items-center space-x-4 hover:shadow-2xl transition duration-300">
                {/* Left Side: Square background with Round Image */}
                <div className="w-10 h-10 bg-primary rounded-xl flex justify-center items-center shadow-lg overflow-hidden">
                  <img
                    src={html}
                    alt="User Photo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
  
                {/* Content Section */}
                <div className="flex flex-col flex-grow space-y-2">
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    Lesson 0{index + 1}
                  </p>
                  <p className="text-base font-medium text-gray-600 dark:text-gray-300">
                    Basics of inline CSS
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
    </>
  );
  
};

export default RecordedCourseLessons;
