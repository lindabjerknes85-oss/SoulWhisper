type LogoProps = {
  className?: string;
  size?: number;
};

export function Logo({ className = '', size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <circle
        cx="50"
        cy="50"
        r="45"
        fill="url(#logoGradient)"
        opacity="0.1"
      />

      <path
        d="M30 35 L50 25 L70 35 L70 55 L50 65 L30 55 Z"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />

      <circle
        cx="50"
        cy="40"
        r="3"
        fill="url(#logoGradient)"
        className="animate-pulse"
      />

      <path
        d="M40 45 L45 50 L40 55"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M60 45 L55 50 L60 55"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <line
        x1="47"
        y1="50"
        x2="53"
        y2="50"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <g opacity="0.6">
        <circle cx="35" cy="25" r="2" fill="#22D3EE" className="animate-pulse" style={{animationDelay: '0.5s'}} />
        <circle cx="65" cy="25" r="2" fill="#3B82F6" className="animate-pulse" style={{animationDelay: '1s'}} />
        <circle cx="75" cy="45" r="2" fill="#06B6D4" className="animate-pulse" style={{animationDelay: '1.5s'}} />
      </g>
    </svg>
  );
}
