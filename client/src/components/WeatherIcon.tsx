import React from 'react';

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy';

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = 'w-6 h-6' }) => {
  switch (condition) {
    case 'sunny':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`${className} text-amber-500`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" 
          />
        </svg>
      );
    
    case 'cloudy':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`${className} text-gray-400`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" 
          />
        </svg>
      );
    
    case 'rainy':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`${className} text-blue-400`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M7 19v2M11 19v2M15 19v2" 
          />
        </svg>
      );
    
    case 'snowy':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`${className} text-blue-200`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M10 17l-2 2m0 0l-2-2m2 2l2-2m-2 2l-2 2m8-6l-2 2m0 0l-2-2m2 2l2-2m-2 2l-2 2" 
          />
        </svg>
      );
    
    default:
      return null;
  }
};

export default WeatherIcon;