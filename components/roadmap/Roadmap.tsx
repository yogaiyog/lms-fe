'use client';

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
}: RoadmapProps) {
  const { points, pathD, viewBoxWidth, totalHeight } = useRoadmapPath({
    itemCount: items.length,
    spacing,
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
      role="list"
      aria-label="Learning roadmap"
      className={['relative mx-auto w-full max-w-md px-4 md:max-w-2xl md:px-8', className].join(' ')}
      style={{ height: totalHeight }}
    >
      <RoadPath
        pathD={pathD}
        viewBoxWidth={viewBoxWidth}
        totalHeight={totalHeight}
        roadWidth={roadWidth}
        roadColor={roadColor}
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
