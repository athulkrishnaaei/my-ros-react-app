import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

function App() {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');

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

    // Subscribing to a Topic
    const listener = new ROSLIB.Topic({
      ros: ros,
      name: '/chatter',
      messageType: 'std_msgs/msg/String',
    });

    listener.subscribe((message) => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, message.data];
        // Keep only the last 5 messages
        return updatedMessages.slice(Math.max(0, updatedMessages.length - 5));
      });
    });

    // Clean up on component unmount
    return () => {
      listener.unsubscribe();
      ros.close();
    };
  }, []); // Empty dependency array ensures the effect runs once when the component mounts

  return (
    <div>
      <h1>ROS React App</h1>
      <p>Connection Status: {connectionStatus}</p>
      <h2>Last 5 Received Messages</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
