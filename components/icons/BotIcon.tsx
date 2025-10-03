import React from 'react';

const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 3.5c-1.5 1.5-2 4-1.5 6s1.5 3.5 0 5c-1.5 1.5-4 2-6 1.5s-3.5-1.5-5 0" />
    <path d="M9.5 20.5c1.5-1.5 2-4 1.5-6s-1.5-3.5 0-5c1.5-1.5 4-2 6-1.5s3.5 1.5 5 0" />
    <path d="M14 8h.01" />
    <path d="M10 16h.01" />
    <path d="M12 12h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
  </svg>
);

export default BotIcon;