'use client';

import { motion } from 'framer-motion';

interface RoadPathProps {
  pathD: string;
  viewBoxWidth: number;
  totalHeight: number;
  roadWidth: number;
  roadColor: string;
  itemColors: string[];
  animated: boolean;
}

export function RoadPath({ pathD, viewBoxWidth, totalHeight, roadWidth, roadColor, itemColors, animated }: RoadPathProps) {
  if (!pathD) return null;

  const dashWidth = Math.max(roadWidth * 0.07, 3);

  const gradientId = "roadGradient";

  const reducedColors: string[] = [];
  for (let i = 0; i < itemColors.length; i += 2) {
    reducedColors.push(itemColors[i]);
  }

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${totalHeight}`}
      width="100%"
      height={totalHeight}
      preserveAspectRatio="none"
      className="absolute inset-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          {reducedColors.map((c, i) => (
            <stop
              key={i}
              offset={`${(i / Math.max(reducedColors.length - 1, 1)) * 100}%`}
              stopColor={c}
            />
          ))}
        </linearGradient>
        <filter id="roadmap-road-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.16" />
        </filter>
      </defs>

      {/* thick base road */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={roadWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#roadmap-road-shadow)"
        initial={animated ? { pathLength: 0 } : false}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* white dashed centerline */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#ffffff"
        strokeWidth={dashWidth}
        strokeLinecap="round"
        strokeDasharray="16 20"
        opacity={0.9}
        initial={animated ? { pathLength: 0 } : false}
        animate={animated ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.12 }}
      />
    </svg>
  );
}
