import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const Web3DAnimation = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    currentMount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Nodes and Lines
    const nodes = [];
    const numNodes = 50;
    const nodeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Cyan nodes

    for (let i = 0; i < numNodes; i++) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      nodes.push(node);
      scene.add(node);
    }

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.1 });
    const maxDistance = 2;

    function connectNodes() {
      // Remove existing lines
      scene.children = scene.children.filter(obj => !(obj instanceof THREE.Line));

      for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
          const dist = nodes[i].position.distanceTo(nodes[j].position);
          if (dist < maxDistance) {
            const points = [];
            points.push(nodes[i].position);
            points.push(nodes[j].position);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            scene.add(line);
          }
        }
      }
    }

    connectNodes();

    camera.position.z = 5;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      nodes.forEach(node => {
        node.position.x += (Math.random() - 0.5) * 0.01;
        node.position.y += (Math.random() - 0.5) * 0.01;
        node.position.z += (Math.random() - 0.5) * 0.01;

        // Keep nodes within bounds
        if (node.position.x > 5 || node.position.x < -5) node.position.x *= -1;
        if (node.position.y > 5 || node.position.y < -5) node.position.y *= -1;
        if (node.position.z > 5 || node.position.z < -5) node.position.z *= -1;
      });

      connectNodes(); // Reconnect lines each frame

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: -1 }} />;
};

export default Web3DAnimation;