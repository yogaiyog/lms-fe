'use client';

import { useRef, useState, useEffect } from 'react';
import { RoadPath } from './RoadPath';
import { RoadStep } from './RoadStep';
import { useRoadmapPath } from './useRoadmapPath';
import type { RoadmapProps } from './types';

export function Roadmap({
  items,
  roadWidth = 80,
  spacing = 250,
  animated = true,
  roadColor = '#6366f1',
  onStepSelect,
  className = '',
  randomize = true,
}: RoadmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [laneSpread, setLaneSpread] = useState(0.56);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setLaneSpread(Math.min(0.70, Math.max(0.30, w / 1000)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { points, pathD, viewBoxWidth, totalHeight } = useRoadmapPath({
    itemCount: items.length,
    spacing,
    laneSpread,
    randomize,
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
        No roadmap steps yet.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label="Learning roadmap"
      className={['relative mx-auto w-full max-w-xl px-4 lg:max-w-3xl lg:px-8', className].join(' ')}
      style={{ height: totalHeight }}
    >
      <RoadPath
        pathD={pathD}
        viewBoxWidth={viewBoxWidth}
        totalHeight={totalHeight}
        roadWidth={roadWidth}
        roadColor={roadColor}
        itemColors={items.map((i) => i.color)}
        animated={animated}
      />

      {items.map((item, index) => {
        const point = points[index];
        if (!point) return null;

        return (
          <div role="listitem" key={item.id}>
            <RoadStep
              item={item}
              index={index}
              xPercent={(point.x / viewBoxWidth) * 100}
              y={point.y}
              animated={animated}
              onSelect={onStepSelect}
            />
          </div>
        );
      })}
    </div>
  );
}
