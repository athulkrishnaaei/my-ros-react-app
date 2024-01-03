import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import ROSLIB from 'roslib';

const LaserScanViewer = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    camera.position.z = 5;

    const laserScanListener = new ROSLIB.Topic({
      ros: new ROSLIB.Ros({ url: 'ws://localhost:9090' }),
      name: '/scan',
      messageType: 'sensor_msgs/LaserScan',
    });

    const points = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ size: 1.0 }));

    scene.add(points);

    laserScanListener.subscribe((message) => {
      const positions = [];

      message.ranges.forEach((range, index) => {
        const angle = message.angle_min + index * message.angle_increment;
        const x = range * Math.cos(angle);
        const y = range * Math.sin(angle);
        const z = 0;

        positions.push(x, y, z);
      });

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

      points.geometry.dispose();
      points.geometry = geometry;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      laserScanListener.unsubscribe();
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default LaserScanViewer;
