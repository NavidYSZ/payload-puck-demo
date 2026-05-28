import React from 'react'

const Icon: React.FC = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <linearGradient id="icon-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#6366F1" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
    <rect width="36" height="36" rx="8" fill="url(#icon-grad)" />
    <path
      d="M10 12 L18 12 L18 24 L10 24 Z M22 12 L26 12 L26 16 L22 16 Z M22 20 L26 20 L26 24 L22 24 Z"
      fill="white"
      fillOpacity="0.95"
    />
  </svg>
)

export default Icon
