// NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/fake_pose_topic">Fake Pose Topic</Link>
        </li>
        <li>
          <Link to="/chatter">Chatter</Link>
        </li>
        <li>
          <Link to="/rosout">ROSout</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
