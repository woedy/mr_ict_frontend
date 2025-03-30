// src/components/Sidebar.jsx
const EdSidebar = () => {
    return (
      <aside className="w-35 bg-white text-white p-4 flex flex-col space-y-1">

        <div className="text-black p-2 font-semibold rounded-full hover:bg-gray-700 cursor-pointer">Files</div>
        <div className="text-black px-2 rounded-full hover:bg-gray-700 cursor-pointer">index.html</div>
        <div className="text-bodydark2 px-2 rounded-full hover:bg-gray-700 cursor-pointer">styles.css</div>
        <div className="text-bodydark2 px-2 rounded-full hover:bg-gray-700 cursor-pointer">scripts.js</div>

      </aside>
    );
  };
  
  export default EdSidebar;
  