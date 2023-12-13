// import React, { useEffect, useState } from 'react';
// import ROSLIB from 'roslib';
// import logo from './eurotable.svg' 
// import DynamicSVGWithCircle from './components/DynamicSVGWithCircle';
// import './App.css';
// function App() {
//   const [messages, setMessages] = useState([]);
//   const [fakePoseMessages, setFakePoseMessages] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState('Not Connected');
//   const [circlePosition, setCirclePosition] = useState({ x: 10, y: 10 });
//   let Logo = require('./table.jpeg')
//   useEffect(() => {
//     // Connecting to ROS
//     const ros = new ROSLIB.Ros({
//       url: 'ws://localhost:9090',
//     });

//     const logToConsole = (message) => {
//       setConnectionStatus(message);
//     };

//     ros.on('connection', () => {
//       logToConsole('Connected to websocket server.');
//     });

//     ros.on('error', (error) => {
//       logToConsole('Error connecting to websocket server: ' + error);
//     });

//     ros.on('close', () => {
//       logToConsole('Connection to websocket server closed.');
//     });

//     // Subscribing to Chatter Topic
//     const listener = new ROSLIB.Topic({
//       ros: ros,
//       name: '/chatter',
//       messageType: 'std_msgs/msg/String',
//     });
//     //Subscribing to pose topic

//     listener.subscribe((message) => {
//       setMessages((prevMessages) => {
//         const updatedMessages = [...prevMessages, message];
//         // Keep only the last 5 messages
//         return updatedMessages.slice(Math.max(0, updatedMessages.length - 5));
//       });

//       // Update the circle position based on the received data
//       setCirclePosition({
//         x: circlePosition.x , // Adjust the scale factor as needed
//         y: circlePosition.y , // Adjust the scale factor as needed
//       });
//     });
  
//     const fakePoseListener = new ROSLIB.Topic({
//       ros: ros,
//       name: '/fake_pose_topic',
//       messageType: 'geometry_msgs/msg/PoseStamped',
//     });

//     fakePoseListener.subscribe((message) => {
//       setFakePoseMessages((prevMessages) => {
//         const updatedMessages = [...prevMessages, message];
//         // Keep only the last 5 messages
//         return updatedMessages.slice(Math.max(0, updatedMessages.length - 5));
//       });

//       // Update the circle position based on the received data
//       setCirclePosition({
//         x: message.pose.position.x,
//         y: message.pose.position.y,
//       });
//     });

//     // Clean up on component unmount
//     return () => {
//       listener.unsubscribe();
//       ros.close();
//     };
//   }, [circlePosition]); // Include circlePosition in the dependency array

//   return (
//     <div className="app-container">
//     <header>
//       <h1>ROS React App</h1>
//       <p>Connection Status: {connectionStatus}</p>
//     </header>

//     <section className="content-section">
//       <h2>Last 5 Received Messages</h2>
//       <ul>
//         {messages.map((message, index) => (
//           <li key={index}>{JSON.stringify(message)}</li>
//         ))}
//       </ul>
//     </section>
    
//     <DynamicSVGWithCircle />
    
   
//     {/* <section className="svg-section">
    
//     <img src={logo} className="App-logo" alt="logo" width={800} height={500}/>
//     {/* <circle cx={circlePosition.x} cy={circlePosition.y} r="100" fill="red" /> */}
//     {/* <svg>
//       <circle cx="10" cy="0" r="10" stroke="red" stroke-width="10" fill="none" />
//     </svg>
     
//     </section> */}
//   </div>

//   );
// }

// export default App;


//////////////////////////////////////////////////////////////////////
import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import DynamicSVGWithCircle from './components/DynamicSVGWithCircle';
import './App.css';

function App() {

  const MyContext = React.createContext();
  const [chatterMessages, setChatterMessages] = useState([]);
  const [fakePoseMessages, setFakePoseMessages] = useState([]);
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

    // Clean up on component unmount
    return () => {
      fakePoseListener.unsubscribe();
      chatterListener.unsubscribe();
      ros.close();
    };
  }, []); // Empty dependency array to run the effect only once on mount

  return (
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

        {/* <h2>Last 5 Received /chatter Messages</h2>
        <ul>
          {chatterMessages.map((message, index) => (
            <li key={index}>{JSON.stringify(message)}</li>
          ))}
        </ul> */}
      </section>

      <DynamicSVGWithCircle circlePosition={circlePosition} />
    </div>
  );
}

export default App;
