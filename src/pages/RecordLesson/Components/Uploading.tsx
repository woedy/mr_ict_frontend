const Uploading = ({ message = "Uploading...", progress = null }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-80">
        <div className="flex flex-col items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-lg font-semibold mb-2">{message}</p>
          {progress !== null && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          {progress !== null && (
            <p className="text-sm text-gray-500 mt-2">{progress}%</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Uploading;