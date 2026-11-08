import React from 'react';

interface AheddadEmblemProps {
  className?: string;
  size?: number;
}

export const AheddadEmblem: React.FC<AheddadEmblemProps> = ({ className = '', size = 80 }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#174B3A] transition-transform duration-300 hover:scale-105"
      >
        {/* Outer Circular Medallion */}
        <circle cx="50" cy="50" r="46" stroke="#174B3A" strokeWidth="2.5" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="41" stroke="#E2E8E3" strokeWidth="1" strokeDasharray="3 3" />

        {/* Arch of Seddouk Oufella Sanctuary (Cheikh Aheddad Mausoleum silhouette) */}
        <path
          d="M32 68 V46 C32 36 50 24 50 24 C50 24 68 36 68 46 V68"
          stroke="#174B3A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#E8F0EB"
        />

        {/* Inner Dome & Crescent */}
        <path
          d="M40 68 V50 C40 44 50 38 50 38 C50 38 60 44 60 50 V68"
          stroke="#103D32"
          strokeWidth="1.5"
          fill="#FFFFFF"
        />

        {/* Traditional Minaret Spire */}
        <path d="M50 18 V24" stroke="#174B3A" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="16" r="2.5" fill="#B94A48" />

        {/* Traditional Staff of Cheikh Aheddad (L'Akkar) & Torch of Dignity */}
        <line x1="50" y1="44" x2="50" y2="64" stroke="#174B3A" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M46 48 C46 45 50 42 50 42 C50 42 54 45 54 48 C54 50.5 52.2 52 50 52 C47.8 52 46 50.5 46 48 Z"
          fill="#B94A48"
        />

        {/* Olive Sprigs of Kabylia & Seddouk */}
        <path
          d="M24 58 C22 52 25 45 28 41 M23 54 C21 51 22 47 24 45"
          stroke="#174B3A"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M76 58 C78 52 75 45 72 41 M77 54 C79 51 78 47 76 45"
          stroke="#174B3A"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Foundation Base */}
        <rect x="26" y="68" width="48" height="5" rx="1.5" fill="#174B3A" />
        <rect x="22" y="73" width="56" height="3" rx="1" fill="#103D32" />

        {/* Year & Heritage Text */}
        <text
          x="50"
          y="85"
          textAnchor="middle"
          fontSize="6.5"
          fontWeight="bold"
          fill="#174B3A"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.08em"
        >
          SEDDOUK · 1871
        </text>
      </svg>
    </div>
  );
};
