import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './AnimatedCursor.css';

const AnimatedCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [trail, setTrail] = useState([]);
  const trailRef = useRef([]);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Update trail
      trailRef.current = [
        { x: e.clientX, y: e.clientY, id: Date.now() },
        ...trailRef.current.slice(0, 8)
      ];
      setTrail([...trailRef.current]);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e) => {
      if (
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'A' ||
        e.target.classList.contains('clickable') ||
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.closest('.clickable')
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e) => {
      if (
        !e.relatedTarget ||
        (e.relatedTarget.tagName !== 'BUTTON' &&
         e.relatedTarget.tagName !== 'A' &&
         !e.relatedTarget.classList.contains('clickable') &&
         !e.relatedTarget.closest('button') &&
         !e.relatedTarget.closest('a') &&
         !e.relatedTarget.closest('.clickable'))
      ) {
        setIsHovering(false);
      }
    };

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Add event listeners
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* Cursor Trail */}
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="cursor-trail"
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{
            opacity: 0,
            scale: 0.3,
            x: point.x - 6,
            y: point.y - 6,
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
          style={{
            position: 'fixed',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: `linear-gradient(45deg, 
              hsl(${index * 30 + 200}, 70%, 60%), 
              hsl(${index * 30 + 240}, 80%, 70%)
            )`,
            pointerEvents: 'none',
            zIndex: 9998,
            mixBlendMode: 'multiply',
          }}
        />
      ))}

      {/* Main Cursor */}
      <motion.div
        className="custom-cursor"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isHovering ? 1.5 : isClicking ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 400,
          mass: 0.5,
        }}
        style={{
          position: 'fixed',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isHovering 
            ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' 
            : isClicking
            ? 'linear-gradient(45deg, #a8e6cf, #ff8a80)'
            : 'linear-gradient(45deg, #667eea, #764ba2)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0.9,
          boxShadow: `
            0 0 20px rgba(102, 126, 234, 0.4),
            0 0 40px rgba(118, 75, 162, 0.2),
            inset 0 0 20px rgba(255, 255, 255, 0.2)
          `,
        }}
      >
        {/* Inner ring */}
        <motion.div
          animate={{
            rotate: 360,
            scale: isHovering ? 1.2 : 1,
          }}
          transition={{
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              type: "spring",
              damping: 20,
              stiffness: 300,
            },
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.6)',
            borderTop: '2px solid transparent',
          }}
        />

        {/* Center dot */}
        <motion.div
          animate={{
            scale: isClicking ? 1.5 : 1,
          }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 300,
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
          }}
        />

        {/* Hover effect ring */}
        {isHovering && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 2, opacity: 0.3 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '2px solid #4ecdc4',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Click effect */}
        {isClicking && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>

      {/* Particle effects on click */}
      {isClicking && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              initial={{
                x: mousePosition.x,
                y: mousePosition.y,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: mousePosition.x + (Math.cos(i * 60 * Math.PI / 180) * 50),
                y: mousePosition.y + (Math.sin(i * 60 * Math.PI / 180) * 50),
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
              }}
              style={{
                position: 'fixed',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: `hsl(${i * 60 + 200}, 70%, 70%)`,
                pointerEvents: 'none',
                zIndex: 9997,
              }}
            />
          ))}
        </>
      )}
    </>
  );
};

export default AnimatedCursor;
