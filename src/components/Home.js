// Home.js
import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
// import DynamicSVGWithCircle from './components/DynamicSVGWithCircle';
// import RosoutMessage from './components/RosoutMessage';

const Home = () => {
    const MyContext = React.createContext();
    const [chatterMessages, setChatterMessages] = useState([]);
    const [fakePoseMessages, setFakePoseMessages] = useState([]);
    const [rosoutMessages, setRosoutMessages] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('Not Connected');
    const [circlePosition, setCirclePosition] = useState({ x: 10, y: 10 });
  
    useEffect(() => {
      // Connecting to ROS
      const ros = new ROSLIB.Ros({
        url: 'ws://localhost:9090',
      });
  
      const logToConsole = (message) => {
        setConnectionStatus(message);
      };
  
      ros.on('connection', () => {
        logToConsole('Connected to websocket server.');
      });
  
      ros.on('error', (error) => {
        logToConsole('Error connecting to websocket server: ' + error);
      });
  
      ros.on('close', () => {
        logToConsole('Connection to websocket server closed.');
      });
  
      // Subscribing to /fake_pose_topic
      const fakePoseListener = new ROSLIB.Topic({
        ros: ros,
        name: '/fake_pose_topic',
        messageType: 'geometry_msgs/msg/PoseStamped',
      });
  
      fakePoseListener.subscribe((message) => {
        setFakePoseMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, message];
          // Keep only the last 5 messages
          return updatedMessages.slice(Math.max(0, updatedMessages.length - 5));
        });
  
        // Update the circle position based on the received data
        setCirclePosition({
          x: message.pose.position.x,
          y: message.pose.position.y,
        });
      });
  
      // Subscribing to /chatter
      const chatterListener = new ROSLIB.Topic({
        ros: ros,
        name: '/chatter',
        messageType: 'std_msgs/msg/String',
      });
  
      chatterListener.subscribe((message) => {
        setChatterMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, message];
          // Keep only the last 5 messages
          return updatedMessages.slice(Math.max(0, updatedMessages.length - 5));
        });
      });
        // Subscribing to /rosout
      const rosoutListener = new ROSLIB.Topic({
          ros: ros,
          name: '/rosout',
          messageType: 'rcl_interfaces/msg/Log',
      });
    
      rosoutListener.subscribe((message) => {
        setRosoutMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, message];
            // Keep only the last 5 messages
          return updatedMessages
          // .slice(Math.max(0, updatedMessages.length - 5));
        });
      });
      // Clean up on component unmount
      return () => {
        fakePoseListener.unsubscribe();
        chatterListener.unsubscribe();
        rosoutListener.unsubscribe();
        ros.close();
      };
    }, []); // Empty dependency array to run the effect only once on mount
  return (
    // <div>
    //   <h2>Welcome to the Home Page</h2>
    // </div>
    <div className="app-container">
          <header>
          <h1>ROS React App</h1>
          <p>Connection Status: {connectionStatus}</p>
        </header>
      
        <section className="content-section">
          <h2>Last 5 Received /fake_pose_topic Messages</h2>
          <ul>
            {fakePoseMessages.map((message, index) => (
              <li key={index}>{JSON.stringify(message)}</li>
            ))}
          </ul>
        
  
          <h2>Last 5 Received /chatter Messages</h2>
          {/* <h2>Last 5 Received /rosout Messages</h2> */}
          <div
            style={{
          height: '300px',
          overflowY: 'scroll',
          border: '1px solid #ccc',
          padding: '10px',
        }}
           >
        
          <ul>
            {chatterMessages.map((message, index) => (
              <li key={index}>{JSON.stringify(message)}</li>
            ))}
          </ul>
        {/* Add more content as needed */}
      </div> 
          <ul>
            {chatterMessages.map((message, index) => (
              <li key={index}>{JSON.stringify(message)}</li>
            ))}
          </ul>
        </section>
        <h1>Map</h1>
      {/* <DynamicSVGWithCircle circlePosition={circlePosition} /> */}
    </div>
  );
};

export default Home;