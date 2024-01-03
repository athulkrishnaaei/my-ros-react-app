
import React, { useEffect, useState } from 'react';
import ROSLIB from 'roslib';
import DynamicSVGWithCircle from './components/DynamicSVGWithCircle';
import './App.css';

function App() {
  const [ros, setRos] = useState(null);
  const [path, setPath] = useState([]);
  const [topicName, setTopicName] = useState('/chatter');
  const [messageType, setMessageType] = useState('std_msgs/msg/String');
  const [customTopic, setCustomTopic] = useState('');
  
  const [chatterListener, setChatterListener] = useState(null)


  const [chatterMessages, setChatterMessages] = useState([]);
  const [NavMessages, setNavMessages] = useState([]);
  const [rosoutMessages, setRosoutMessages] = useState([]);
  
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  const [circlePosition, setCirclePosition] = useState({ x: 1500, y: 1000 ,z: 0,w: 0});

  const sendCommand = (linear, angular, ros) => {
    if (ros) {
      const twist = new ROSLIB.Message({
        linear: { x: linear, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: angular },
      });

      const cmdVel = new ROSLIB.Topic({
        ros,
        name: '/cmd_vel',
        messageType: 'geometry_msgs/msg/Twist',
      });

      cmdVel.publish(twist);
    }
  };
  

  const getMessageType = (messageType) => {
    let textColor="green"
    switch (messageType) {
      case 10:
        return ['DEBUG',textColor="red"];
      case 20:
        return ['INFO',textColor="green"];
      case 30:
        return ['WARN',textColor="red"];
      case 40:
        return ['ERROR',textColor="red"];
      case 50:
        return ['FATAL',textColor="red"];
      default:
        return [`Level ${messageType}`,,textColor="green"];
    }
  };
  
  const handleTopicChange = (e) => {
    // setChatterMessages([]);
  
    setTopicName(e.target.value);
    switch (e.target.value) {
      case '/chatter':
        setMessageType("std_msgs/msg/String");
        break;
      case '/scan':
        setMessageType("sensor_msgs/msg/LaserScan");
        break;
      case '/cmd_vel':
        setMessageType("geometry_msgs/msg/Twist");
        break;
      case '/rosout':
        setMessageType("rcl_interfaces/msg/Log");
        break;
      case '/robot_description':
        setMessageType("std_msgs/msg/String");
        break;
      case '/tf':
        setMessageType("tf2_msgs/msg/TFMessage");
        break;
      default:
        // Handle default case if none of the above matches
        setMessageType("std_msgs/msg/String");
        break;
    }
    
  };

  // const handleMessageTypeChange = (e) => {
  //   setMessageType(e.target.value);
  // };

  const handleFormSubmit = (e) => {
  
    e.preventDefault();
    if (chatterListener) {
      chatterListener.unsubscribe();
    }
    // Create or update ROS topic with new values
    const newChatterListener = new ROSLIB.Topic({
      ros: ros,
      name: topicName,
      messageType: messageType,
    });

    // Subscribing to /chatter
    newChatterListener.subscribe((message) => {
      setChatterMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, message];
        // Keep only the last 5 messages
        return updatedMessages.slice(Math.max(0, updatedMessages.length - 5));
      });
    });
    setChatterListener(newChatterListener);
    setChatterMessages([]);
    // setNavMessages([]);
    // setRosoutMessages([]);
  };

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
    setRos(ros);

    // Telop Keyboard

    // Subscribing to /
    // const NavListener = new ROSLIB.Topic({
    //   ros: ros,
    //   name: '/tf',
    //   messageType: 'tf2_msgs/msg/TFMessage',
    // });

    const NavListener = new ROSLIB.Topic({
      ros: ros,
      name: '/odom',
      messageType: 'nav_msgs/msg/Odometry',
    });

    NavListener.subscribe((message) => {
      setNavMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, message];
        // Keep only the last 5 messages
        return updatedMessages.slice(Math.max(0, updatedMessages.length - 5));
      });

      // Update the circle position based on the received data
      setCirclePosition({
        x: 1500+message.pose.pose.position.y*-100,
        // .transforms[0].transform.translation.x*100,
        y: 1000+message.pose.pose.position.x*-100,
        // .transforms[0].transform.translation.y*100,
        z: message.pose.pose.orientation.z,
        // .transforms[0].transform.rotation.z*10,
        w: message.pose.pose.orientation.w
        // .transforms[0].transform.rotation.w*10
        
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
            return updatedMessages;
            // .slice(Math.max(0, updatedMessages.length - 5));
          });
        });

     
        const pathTopic = new ROSLIB.Topic({
          ros: ros,
          name: '/plan',
          messageType: 'nav_msgs/msg/Path', // Adjust messageType as per your setup
        });
    
        pathTopic.subscribe((message) => {
          // Assuming message is an array of poses in geometry_msgs/PoseStamped
          // const newPath = message.pose((pose) => ({
          //   x: pose.position.x,
          //   y: pose.position.y,
          // }));
          setPath(message.header.pose.pose.position.x);
        });

    // Clean up on component unmount
    return () => {
      NavListener.unsubscribe();
      rosoutListener.unsubscribe();
      pathTopic.unsubscribe();
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
          {NavMessages.map((message, index) => (
            <li key={index}>{JSON.stringify(message.pose.pose.orientation)}</li>
          ))}
        </ul>

        <h2>Last 5 Received /rosout Messages</h2>
        <div
          style={{
            height: '300px',
            overflowY: 'scroll',
            border: '1px solid #ccc',
            padding: '10px',
          }}
        >   
          <ul>
            {rosoutMessages.map((message, index) => (
           
              <li style={{color: "black"}} key={index}> Level: {getMessageType(message.level)[0]}, Name: {message.name}, Message: {message.msg}</li>
              
            ))}
          </ul>
   
    
        </div>
        <div>
        <form onSubmit={handleFormSubmit}>
          <label>
            Select Topic Name:
            <select value={topicName} onChange={handleTopicChange}>
              <option value="/chatter">/chatter</option>
              <option value="/cmd_vel">/cmd_vel</option>
              <option value="/rosout">/rosout</option>
              <option value="/robot_description">/robot_description</option>
              <option value="/scan">/scan</option>
              <option value="/tf">/tf</option>
              <option value="/other_topic">/other_topic</option>
            
            </select>
          </label>
        
          <button type="submit">Update ROS Topic</button>
        </form>
        </div>
        <h2>Last 5 Received {topicName} Messages</h2>
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
        </div>
      </section>

      <DynamicSVGWithCircle circlePosition={circlePosition} />
      <h1>path : {path}</h1>
   <div class="teleop-keyboard">
    <h1>Teleop Keyboard</h1>
    <button 
    class="direction-button" 
    id="forward"  
    onMouseDown={() => sendCommand(1, 0, ros)}
    onMouseUp={() => sendCommand(0, 0, ros)}>F</button>
    <div class="horizontal-buttons">
      <button 
      class="direction-button" 
      id="left"
      onMouseDown={() => sendCommand(0, 1, ros)}
      onMouseUp={() => sendCommand(0, 0, ros)}
      >L</button>
      <button 
      class="direction-button" 
      id="right"
      onMouseDown={() => sendCommand(0, -1, ros)}
      onMouseUp={() => sendCommand(0, 0, ros)}>R</button>
    </div>
    <button class="direction-button" id="backward"          
      onMouseDown={() => sendCommand(-1, 0, ros)}
      onMouseUp={() => sendCommand(0, 0, ros)}>B</button>
  </div>
      
      {/* <form onSubmit={handleFormSubmit}>
        <label>
          Topic Name:
          <input
            type="text"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
          />
        </label>
        <button type="submit">Update ROS Topic</button>
      </form>
      <h2>Last 5 Received {topicName} Messages</h2>
        <div
          style={{
            height: '300px',
            overflowY: 'scroll',
            border: '1px solid #ccc',
            padding: '10px',
          }}
        >rotate
            {chatterMessages.map((message, index) => (
              <li key={index}>{JSON.stringify(message)}</li>
            ))}
          </ul>
        </div> */}

      
    </div>
    
  );
}

export default App;
