/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, type ReactNode } from 'react';

const fallbackEmojis = ['🌱', '🧩', '⚡', '⚛️', '🎛️', '🏆', '💡', '📚', '🧭', '🚀', '🎯', '✨'];

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getRoadmapFallbackEmoji(seed: string) {
  if (!seed.trim()) return fallbackEmojis[0];
  return fallbackEmojis[hashSeed(seed) % fallbackEmojis.length];
}

type RoadmapAvatarProps = {
  label: string;
  imageUrl?: string | null;
  icon?: ReactNode;
  fallbackSeed?: string;
  className?: string;
};

export function RoadmapAvatar({ label, imageUrl, icon, fallbackSeed, className = '' }: RoadmapAvatarProps) {
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const src = imageUrl?.trim();

  if (src && brokenSrc !== src) {
    return (
      <span aria-hidden="true" className={className}>
        <img
          src={src}
          alt=""
          onError={() => setBrokenSrc(src)}
          className="block h-full w-full rounded-full object-cover"
        />
      </span>
    );
  }

  if (icon) {
    return <span className={className}>{icon}</span>;
  }

  return (
    <span aria-hidden="true" className={['inline-flex items-center justify-center', className].join(' ')}>
      {getRoadmapFallbackEmoji(fallbackSeed ?? label)}
    </span>
  );
}
