import React from 'react';

export interface VyroLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'symbol' | 'horizontal';
  showTagline?: boolean;
  inverted?: boolean;
  className?: string;
}

export const VyroLogo: React.FC<VyroLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = true,
  inverted = false,
  className = '',
}) => {
  // Dimensions map
  const dimensions = {
    xs: { symbol: 24, textVyro: 'text-base', textTagline: 'text-[8px]' },
    sm: { symbol: 32, textVyro: 'text-xl', textTagline: 'text-[10px]' },
    md: { symbol: 44, textVyro: 'text-2xl', textTagline: 'text-[11px]' },
    lg: { symbol: 64, textVyro: 'text-3xl', textTagline: 'text-xs' },
    xl: { symbol: 88, textVyro: 'text-4xl', textTagline: 'text-sm' },
    '2xl': { symbol: 110, textVyro: 'text-5xl', textTagline: 'text-base' },
  }[size];

  const textColor = inverted ? 'text-white' : 'text-[#102A56]';
  const taglineColor = inverted ? 'text-slate-300' : 'text-[#64748B]';

  // Official VYRO Symbol: The Partner Handshake forming a Heart & Connected Loop
  const SymbolSvg = () => (
    <svg
      width={dimensions.symbol}
      height={dimensions.symbol}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 select-none"
    >
      <defs>
        {/* Outer Ring Multi-stop Gradient: Red-Orange -> Amber -> Cyan -> Royal Blue -> Indigo */}
        <linearGradient id="vyroRingGradNew" x1="0%" y1="20%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#FF3815" />
          <stop offset="20%" stopColor="#FF8A00" />
          <stop offset="38%" stopColor="#FFB703" />
          <stop offset="55%" stopColor="#00D2FF" />
          <stop offset="78%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#2434D6" />
        </linearGradient>

        {/* Orange Figure Gradient (Left Retailer Partner) */}
        <linearGradient id="vyroOrangeGradNew" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#FFB300" />
          <stop offset="35%" stopColor="#FF8000" />
          <stop offset="75%" stopColor="#FF4000" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        {/* Blue Figure Gradient (Right Wholesaler Partner) */}
        <linearGradient id="vyroBlueGradNew" x1="80%" y1="10%" x2="20%" y2="90%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="35%" stopColor="#00A2FF" />
          <stop offset="75%" stopColor="#0062FF" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Orange Head Gradient */}
        <linearGradient id="vyroOrangeHeadNew" x1="30%" y1="10%" x2="70%" y2="90%">
          <stop offset="0%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#FF5722" />
        </linearGradient>

        {/* Blue Head Gradient */}
        <linearGradient id="vyroBlueHeadNew" x1="30%" y1="10%" x2="70%" y2="90%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        <filter id="handshakeShadowNew" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="3" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* Clean Circular Background */}
      <circle cx="250" cy="250" r="240" fill={inverted ? '#0F172A' : '#FFFFFF'} />

      {/* Outer Gradient Ring */}
      <circle
        cx="250"
        cy="250"
        r="228"
        stroke="url(#vyroRingGradNew)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />

      {/* Main Symbol: Two Interlocking Figures Shaking Hands */}
      <g id="vyro-emblem-main">
        {/* Left Figure Head (Orange) */}
        <circle cx="180" cy="162" r="35" fill="url(#vyroOrangeHeadNew)" />

        {/* Right Figure Head (Blue) */}
        <circle cx="320" cy="162" r="35" fill="url(#vyroBlueHeadNew)" />

        {/* Right Figure (Blue Ribbon Body & Arm) */}
        <path
          d="M 334 202
             C 372 208 396 238 396 274
             C 396 322 355 362 294 362
             C 275 362 258 354 246 342
             C 238 334 228 322 222 312
             C 234 298 252 288 266 276
             C 276 268 288 256 295 244
             C 314 246 328 260 334 278
             C 338 290 332 305 320 314
             C 312 320 300 324 290 324
             C 276 324 266 318 258 310
             C 272 298 288 284 300 270
             C 312 256 318 244 322 232
             C 328 220 332 210 334 202 Z"
          fill="url(#vyroBlueGradNew)"
        />

        {/* Left Figure (Orange Ribbon Body & Arm) */}
        <path
          d="M 166 202
             C 128 208 104 238 104 274
             C 104 322 145 362 206 362
             C 225 362 242 354 254 342
             C 262 334 272 322 278 312
             C 266 298 248 288 234 276
             C 224 268 212 256 205 244
             C 186 246 172 260 166 278
             C 162 290 168 305 180 314
             C 188 320 200 324 210 324
             C 224 324 234 318 242 310
             C 228 298 212 284 200 270
             C 188 256 182 244 178 232
             C 172 220 168 210 166 202 Z"
          fill="url(#vyroOrangeGradNew)"
        />

        {/* Overlapping Clasp: Orange hand crossing over */}
        <path
          d="M 242 310
             C 254 298 268 284 282 272
             C 287 268 292 272 290 278
             C 282 292 270 306 256 318
             C 250 324 242 318 242 310 Z"
          fill="url(#vyroOrangeGradNew)"
          filter="url(#handshakeShadowNew)"
        />

        {/* Blue hand interlocking clasp */}
        <path
          d="M 258 310
             C 246 298 232 284 218 272
             C 213 268 208 272 210 278
             C 218 292 230 306 244 318
             C 250 324 258 318 258 310 Z"
          fill="url(#vyroBlueGradNew)"
          opacity="0.96"
        />

        {/* Inner Heart Negative Space */}
        <path
          d="M 250 248
             C 236 234 212 226 195 240
             C 182 252 182 272 198 288
             C 216 306 238 322 250 332
             C 262 322 284 306 302 288
             C 318 272 318 252 305 240
             C 288 226 264 234 250 248 Z"
          fill={inverted ? '#0F172A' : '#FFFFFF'}
        />

        {/* Inner Heart Loop Detail */}
        <path
          d="M 250 256
             C 240 244 222 238 210 248
             C 200 257 202 270 214 282
             C 226 296 242 308 250 316
             C 258 308 274 296 286 282
             C 298 270 300 257 290 248
             C 278 238 260 244 250 256 Z"
          fill={inverted ? '#0F172A' : '#FFFFFF'}
        />
      </g>
    </svg>
  );

  if (variant === 'symbol') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} title="VYRO — Business, Connected.">
        <SymbolSvg />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`} title="VYRO — Business, Connected.">
      <SymbolSvg />
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight ${dimensions.textVyro} ${textColor} flex items-baseline`}>
          <span>VY</span>
          <span className="text-[#1769E0]">R</span>
          <span className="text-[#0EA5A4] relative">
            O
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F59E0B] ml-0.5 align-top" />
          </span>
        </div>
        {showTagline && (
          <span className={`font-bold tracking-widest uppercase mt-0.5 ${dimensions.textTagline} ${taglineColor}`}>
            Business, Connected.
          </span>
        )}
      </div>
    </div>
  );
};
