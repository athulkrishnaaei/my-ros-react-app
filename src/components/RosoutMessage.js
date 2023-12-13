// import React from 'react';
import React, { useState, useEffect } from 'react';
// import RosoutViewer from './RosoutViewer';
const RosoutMessage = ({rosoutMessages}) => {
    const [currentrosoutMessages, setCurrentRosoutMessages] = useState();
  
    useEffect(() => {
      // Update the local state with the received prop
      setCurrentRosoutMessages(rosoutMessages);
    }, [rosoutMessages]);
// const App = () => {
//   const rosoutData = "hello";

  return (
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
      <li key={index}>{JSON.stringify(message)}</li>
    ))}
  </ul>
{/* Add more content as needed */}
</div>
  );
};

export default RosoutMessage;
