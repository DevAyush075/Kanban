'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Bot, Sparkles, Hand, Cpu } from 'lucide-react';

interface RobotMascot3DProps {
  isAiWorking?: boolean;
  className?: string;
}

export default function RobotMascot3D({ isAiWorking = false, className = '' }: RobotMascot3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [currentState, setCurrentState] = useState<'default' | 'interaction' | 'contextual'>('default');

  // References for animation manipulation
  const robotGroupRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const headRef = useRef<THREE.Group | null>(null);
  const eyesMeshRef = useRef<THREE.Mesh | null>(null);
  const antiGravityGlowRef = useRef<THREE.PointLight | null>(null);
  const antiGravityRingRef = useRef<THREE.Mesh | null>(null);

  // Track mouse coordinates
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isAiWorking) {
      setCurrentState('contextual');
    } else if (hovered) {
      setCurrentState('interaction');
    } else {
      setCurrentState('default');
    }
  }, [hovered, isAiWorking]);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const width = mountNode.clientWidth || 360;
    const height = mountNode.clientHeight || 420;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 6);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountNode.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffd700, 2.0); // Warm gold key light
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const tealRimLight = new THREE.DirectionalLight(0x2dd4bf, 3.0); // Teal rim light
    tealRimLight.position.set(-5, 3, -4);
    scene.add(tealRimLight);

    // Anti-gravity base point light
    const antiGravityLight = new THREE.PointLight(0x2dd4bf, 4, 6);
    antiGravityLight.position.set(0, -1.8, 0);
    scene.add(antiGravityLight);
    antiGravityGlowRef.current = antiGravityLight;

    // 5. Materials
    // Antique brass metallic material
    const brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xc59b27,
      metalness: 0.85,
      roughness: 0.35,
    });

    // Darker brass for joints/accents
    const darkBrassMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a4510,
      metalness: 0.9,
      roughness: 0.5,
    });

    // Textured dark teal cape material
    const capeMaterial = new THREE.MeshStandardMaterial({
      color: 0x073642,
      roughness: 0.85,
      side: THREE.DoubleSide,
    });

    // CRT Screen front material (Dark)
    const screenBgMaterial = new THREE.MeshStandardMaterial({
      color: 0x031419,
      roughness: 0.2,
      metalness: 0.5,
    });

    // Luminous glowing teal eyes material
    const glowingTealEyeMaterial = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
    });

    // Robot Master Group
    const robotGroup = new THREE.Group();
    robotGroupRef.current = robotGroup;
    scene.add(robotGroup);

    // --- BODY & TORSO ---
    const torsoGeo = new THREE.CylinderGeometry(0.7, 0.5, 1.2, 16);
    const torso = new THREE.Mesh(torsoGeo, brassMaterial);
    torso.position.y = 0;
    robotGroup.add(torso);

    // Chest emblem / details
    const emblemGeo = new THREE.BoxGeometry(0.4, 0.4, 0.1);
    const emblem = new THREE.Mesh(emblemGeo, darkBrassMaterial);
    emblem.position.set(0, 0.2, 0.55);
    robotGroup.add(emblem);

    const chestLightGeo = new THREE.CircleGeometry(0.12, 16);
    const chestLightMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const chestLight = new THREE.Mesh(chestLightGeo, chestLightMat);
    chestLight.position.set(0, 0.2, 0.61);
    robotGroup.add(chestLight);

    // Belt
    const beltGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.15, 16);
    const belt = new THREE.Mesh(beltGeo, darkBrassMaterial);
    belt.position.y = -0.55;
    robotGroup.add(belt);

    // --- HEAD & MONITOR SCREEN ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.1, 0);
    robotGroup.add(headGroup);
    headRef.current = headGroup;

    // Neck joint
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 12);
    const neck = new THREE.Mesh(neckGeo, darkBrassMaterial);
    neck.position.y = -0.4;
    headGroup.add(neck);

    // Monitor Outer Box (Antique Brass CRT)
    const monitorBoxGeo = new THREE.BoxGeometry(1.2, 0.9, 0.8);
    const monitorBox = new THREE.Mesh(monitorBoxGeo, brassMaterial);
    headGroup.add(monitorBox);

    // Antenna
    const antennaStemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8);
    const antennaStem = new THREE.Mesh(antennaStemGeo, darkBrassMaterial);
    antennaStem.position.set(0.3, 0.65, 0);
    headGroup.add(antennaStem);

    const antennaTipGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const antennaTipMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const antennaTip = new THREE.Mesh(antennaTipGeo, antennaTipMat);
    antennaTip.position.set(0.3, 0.88, 0);
    headGroup.add(antennaTip);

    // CRT Screen Bezel & Screen Face
    const screenFaceGeo = new THREE.PlaneGeometry(0.95, 0.68);
    const screenFace = new THREE.Mesh(screenFaceGeo, screenBgMaterial);
    screenFace.position.set(0, 0, 0.41);
    headGroup.add(screenFace);

    // Glowing Teal Eyes (Large luminous ovals)
    const eyesGroup = new THREE.Group();
    eyesGroup.position.set(0, 0, 0.42);
    headGroup.add(eyesGroup);

    const leftEyeGeo = new THREE.PlaneGeometry(0.25, 0.22);
    const leftEye = new THREE.Mesh(leftEyeGeo, glowingTealEyeMaterial);
    leftEye.position.set(-0.24, 0.03, 0);
    eyesGroup.add(leftEye);

    const rightEyeGeo = new THREE.PlaneGeometry(0.25, 0.22);
    const rightEye = new THREE.Mesh(rightEyeGeo, glowingTealEyeMaterial);
    rightEye.position.set(0.24, 0.03, 0);
    eyesGroup.add(rightEye);

    eyesMeshRef.current = leftEye; // Keep reference to change expression

    // --- SUPERHERO CAPE ---
    const capeShape = new THREE.Shape();
    capeShape.moveTo(-0.5, 0);
    capeShape.lineTo(0.5, 0);
    capeShape.lineTo(0.8, -1.8);
    capeShape.lineTo(-0.8, -1.8);
    capeShape.closePath();

    const capeGeo = new THREE.ShapeGeometry(capeShape);
    const cape = new THREE.Mesh(capeGeo, capeMaterial);
    cape.position.set(0, 0.6, -0.42);
    cape.rotation.x = 0.2; // Drape outward
    robotGroup.add(cape);

    // --- ARMS & HANDS ---
    // Right Arm (Resting stance)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.75, 0.4, 0);
    robotGroup.add(rightArmGroup);

    const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 12);
    const rightArmMesh = new THREE.Mesh(armGeo, brassMaterial);
    rightArmMesh.position.y = -0.35;
    rightArmGroup.add(rightArmMesh);

    const rightHandGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const rightHand = new THREE.Mesh(rightHandGeo, darkBrassMaterial);
    rightHand.position.y = -0.75;
    rightArmGroup.add(rightHand);

    // Left Arm (Interactive Greeting / Waving Arm)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.75, 0.4, 0);
    robotGroup.add(leftArmGroup);
    leftArmRef.current = leftArmGroup;

    const leftArmMesh = new THREE.Mesh(armGeo, brassMaterial);
    leftArmMesh.position.y = -0.35;
    leftArmGroup.add(leftArmMesh);

    const leftHandGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const leftHand = new THREE.Mesh(leftHandGeo, darkBrassMaterial);
    leftHand.position.y = -0.75;
    leftArmGroup.add(leftHand);

    // --- ANTI-GRAVITY BASE GLOW RING ---
    const ringGeo = new THREE.RingGeometry(0.3, 0.7, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.5;
    robotGroup.add(ring);
    antiGravityRingRef.current = ring;

    // Mouse Move Listener for interaction state
    const handleMouseMove = (event: MouseEvent) => {
      const rect = mountNode.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mousePos.current = { x, y };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Render loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // State 1: Default Floating Stance (sinusoidal float + pulse)
      const floatY = Math.sin(elapsedTime * 2.2) * 0.12;
      robotGroup.position.y = floatY;

      // Base anti-gravity ring pulse
      if (antiGravityRingRef.current) {
        const pulse = 0.5 + Math.sin(elapsedTime * 4) * 0.25;
        (antiGravityRingRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
        antiGravityRingRef.current.scale.set(1 + pulse * 0.2, 1 + pulse * 0.2, 1);
      }

      if (antiGravityGlowRef.current) {
        antiGravityGlowRef.current.intensity = 3 + Math.sin(elapsedTime * 4) * 1.5;
      }

      // Smooth camera / head tracking
      const targetRotY = mousePos.current.x * 0.45;
      const targetRotX = -mousePos.current.y * 0.25;

      if (headRef.current) {
        headRef.current.rotation.y += (targetRotY - headRef.current.rotation.y) * 0.08;
        headRef.current.rotation.x += (targetRotX - headRef.current.rotation.x) * 0.08;
      }

      // State 2: Interaction State (Hover Greeting - raises left hand)
      if (leftArmRef.current) {
        if (hovered) {
          // Raise arm up and wave gently
          const wave = Math.sin(elapsedTime * 6) * 0.25;
          leftArmRef.current.rotation.z += (1.8 - leftArmRef.current.rotation.z) * 0.1;
          leftArmRef.current.rotation.x += (wave - leftArmRef.current.rotation.x) * 0.1;
        } else {
          // Return to side
          leftArmRef.current.rotation.z += (0 - leftArmRef.current.rotation.z) * 0.1;
          leftArmRef.current.rotation.x += (0 - leftArmRef.current.rotation.x) * 0.1;
        }
      }

      // State 3: Contextual Working State (AI Working on Kanban board)
      if (isAiWorking && robotGroupRef.current) {
        // Tilt slightly towards Kanban board (left)
        robotGroupRef.current.rotation.y = 0.35 + Math.sin(elapsedTime * 5) * 0.05;
      } else if (robotGroupRef.current) {
        robotGroupRef.current.rotation.y += (mousePos.current.x * 0.2 - robotGroupRef.current.rotation.y) * 0.05;
      }

      // Subtle cape flow
      cape.rotation.x = 0.2 + Math.sin(elapsedTime * 3) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!mountNode) return;
      const w = mountNode.clientWidth;
      const h = mountNode.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [hovered, isAiWorking]);

  return (
    <div
      className={`relative group flex flex-col items-center justify-center ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Interactive 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-[340px] h-[400px] cursor-grab active:cursor-grabbing relative z-10" />

      {/* State Indicator Badges (Matching 3 States) */}
      <div className="flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-full bg-[#072229]/90 border border-[#2dd4bf]/40 text-xs font-semibold text-[#2dd4bf] shadow-xl backdrop-blur-md z-20">
        <Bot className="w-4 h-4 text-[#fbbf24]" />
        {currentState === 'default' && (
          <span className="flex items-center gap-1.5 text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-[#2dd4bf]" />
            Default State • Floating Anti-Gravity
          </span>
        )}
        {currentState === 'interaction' && (
          <span className="flex items-center gap-1.5 text-[#fbbf24] animate-pulse">
            <Hand className="w-3.5 h-3.5 text-[#fbbf24]" />
            Interaction State • Greeting Cursor
          </span>
        )}
        {currentState === 'contextual' && (
          <span className="flex items-center gap-1.5 text-cyan-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            Contextual State • AI Focused Work
          </span>
        )}
      </div>

      {/* Helper hint */}
      <p className="text-[11px] text-slate-400 mt-1">Hover cursor over robot to trigger interaction state</p>
    </div>
  );
}
