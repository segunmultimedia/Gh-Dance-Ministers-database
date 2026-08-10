import React from 'react';

export default function LogoComponent({ size = 42 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Outer Orange Ring */}
      <circle cx="100" cy="100" r="96" fill="#FF3B00" stroke="#FF3B00" strokeWidth="4" />
      
      {/* Black Ring Body */}
      <circle cx="100" cy="100" r="86" fill="#121212" />
      
      {/* Center Orange Core */}
      <circle cx="100" cy="92" r="54" fill="#FF3B00" />
      
      {/* Top White Accent Dots */}
      <circle cx="65" cy="40" r="4.5" fill="#FFFFFF" />
      
      <circle cx="85" cy="30" r="4.5" fill="#FFFFFF" />
      
      <circle cx="115" cy="30" r="4.5" fill="#FFFFFF" />
      
      <circle cx="135" cy="40" r="4.5" fill="#FFFFFF" />
      
      <circle cx="50" cy="58" r="4.5" fill="#FFFFFF" />

      {/* Curved Text "DANCE MINISTERS" Path */}
      <path id="textPath" d="M 42 122 A 64 64 0 0 0 158 122" fill="none" />
      
      <text fill="#FFFFFF" fontSize="13" fontWeight="800" letterSpacing="2.5" textAnchor="middle">
        <textPath href="#textPath" startOffset="50%">
          DANCE MINISTERS
        </textPath>
      </text>

      {/* Stylized GH Overlay Emblem */}
      <g stroke="#121212" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Script G */}
        <path d="M78 60 C 50 60, 42 90, 60 115 C 75 132, 90 120, 88 100 L 70 105" stroke="#121212" fill="none" />
        <path d="M78 60 C 50 60, 42 90, 60 115 C 75 132, 90 120, 88 100 L 70 105" stroke="#FF3B00" strokeWidth="2.5" fill="none" />
        
        {/* Stylized H */}
        <path d="M98 62 L 86 130 M 88 95 L 140 85 M 144 55 L 115 135" stroke="#121212" />
        <path d="M98 62 L 86 130 M 88 95 L 140 85 M 144 55 L 115 135" stroke="#FF3B00" strokeWidth="2.5" />
      </g>
    </svg>
  );
}
