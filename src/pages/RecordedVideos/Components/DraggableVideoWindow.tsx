import React, { useState, useRef, useEffect } from 'react';

const DraggableVideoWindow = ({ video }) => {
  const [position, setPosition] = useState({
    x: 20,
    y: window.innerHeight - 200 - 50,
  });
  const [size, setSize] = useState({ width: 300, height: 200 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [originalState, setOriginalState] = useState(null);

  const windowRef = useRef(null);

  const handleWindowClick = () => {
    if (!isZoomed) {
      setOriginalState({ size, position });
      setSize({ width: window.innerWidth * 0.8, height: window.innerHeight * 0.8 });
      setPosition({
        x: window.innerWidth * 0.1,
        y: window.innerHeight * 0.1,
      });
      setIsZoomed(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isZoomed && windowRef.current && !windowRef.current.contains(e.target)) {
        setSize(originalState.size);
        setPosition(originalState.position);
        setIsZoomed(false);
      }
    };

    if (isZoomed) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isZoomed, originalState]);

  return (
    <div
      ref={windowRef}
      className="fixed bg-white border rounded-lg shadow-lg overflow-hidden"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: 'top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease',
        zIndex: isZoomed ? 1000 : 10,
      }}
      onClick={handleWindowClick}
    >
   
      <div className="overflow-hidden object-cover" style={{ height: `${size.height - 40}px`  }}>
        <video style={{ width: '100%', height: '100%', objectFit: 'contain' }} src={video} >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default DraggableVideoWindow;