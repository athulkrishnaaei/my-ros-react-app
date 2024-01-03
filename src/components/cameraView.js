import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

const CameraViewer = () => {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const ros = new ROSLIB.Ros({
      url: 'ws://localhost:9090',  // Adjust the WebSocket URL based on your ROS2 Bridge configuration
    });

    const imageTopic = new ROSLIB.Topic({
      ros: ros,
      name: '/camera/image_raw',  // Adjust the topic name based on your camera image topic
      messageType: 'sensor_msgs/msg/Image',
    });

    imageTopic.subscribe((message) => {
      setImageData(message);
    });

    return () => {
      imageTopic.unsubscribe();
    };
  }, []);

  return (
    <div>
     {/* <ul>
            {imageData.map((message, index) => (
              <li key={index}>{JSON.stringify(message)}</li>
            ))} */}
          {/* </ul> */}
          {imageData}
    </div>
  );
};

export default CameraViewer;
