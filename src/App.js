import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import logo from './eurotable.svg' 
import DynamicSVGWithCircle from './components/DynamicSVGWithCircle';
import './App.css';
function App() {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  const [circlePosition, setCirclePosition] = useState({ x: 10, y: 10 });
  let Logo = require('./table.jpeg')
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

    // Subscribing to Chatter Topic
    const listener = new ROSLIB.Topic({
      ros: ros,
      name: '/chatter',
      messageType: 'std_msgs/msg/String',
    });
    //Subscribing to pose topic

    listener.subscribe((message) => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, message];
        // Keep only the last 5 messages
        return updatedMessages.slice(Math.max(0, updatedMessages.length - 5));
      });

      // Update the circle position based on the received data
      setCirclePosition({
        x: circlePosition.x , // Adjust the scale factor as needed
        y: circlePosition.y , // Adjust the scale factor as needed
      });
    });

    // Clean up on component unmount
    return () => {
      listener.unsubscribe();
      ros.close();
    };
  }, [circlePosition]); // Include circlePosition in the dependency array

  return (
    <div className="app-container">
    <header>
      <h1>ROS React App</h1>
      <p>Connection Status: {connectionStatus}</p>
    </header>

    <section className="content-section">
      <h2>Last 5 Received Messages</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{JSON.stringify(message)}</li>
        ))}
      </ul>
    </section>
    
    <DynamicSVGWithCircle />
    
   
    {/* <section className="svg-section">
    
    <img src={logo} className="App-logo" alt="logo" width={800} height={500}/>
    {/* <circle cx={circlePosition.x} cy={circlePosition.y} r="100" fill="red" /> */}
    {/* <svg>
      <circle cx="10" cy="0" r="10" stroke="red" stroke-width="10" fill="none" />
    </svg>
     
    </section> */}
  </div>

  );
}

export default App;
