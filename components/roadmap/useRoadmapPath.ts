import { useMemo } from 'react';
import type { RoadmapPoint } from './types';

/**
 * All coordinates live in an abstract viewBox that is horizontally
 * percentage-like (0-1000 == 0%-100% of the container width) and vertically
 * in real pixels. That lets the SVG road and the absolutely-positioned
 * HTML step cards share one coordinate system: x is expressed as `%`,
 * y is expressed in `px`, and both line up perfectly at every breakpoint.
 */
export const VIEWBOX_WIDTH = 1000;

const LANE_LEFT = 220;
const LANE_RIGHT = 780;
const LANE_CENTER = 500;
const TOP_PADDING = 70;
const BOTTOM_PADDING = 90;

interface UseRoadmapPathOptions {
  itemCount: number;
  spacing: number;
}

interface UseRoadmapPathResult {
  points: RoadmapPoint[];
  pathD: string;
  viewBoxWidth: number;
  totalHeight: number;
}

export function useRoadmapPath({ itemCount, spacing }: UseRoadmapPathOptions): UseRoadmapPathResult {
  return useMemo(() => {
    const safeCount = Math.max(itemCount, 0);
    const safeSpacing = Math.max(spacing, 80);

    const totalHeight =
      safeCount <= 1 ? safeSpacing + TOP_PADDING + BOTTOM_PADDING : (safeCount - 1) * safeSpacing + TOP_PADDING + BOTTOM_PADDING;

    const points: RoadmapPoint[] = Array.from({ length: safeCount }, (_, i) => {
      if (safeCount === 1) {
        return { x: LANE_CENTER, y: TOP_PADDING, side: 'center' as const };
      }
      const isEven = i % 2 === 0;
      return {
        x: isEven ? LANE_LEFT : LANE_RIGHT,
        y: TOP_PADDING + i * safeSpacing,
        side: isEven ? ('left' as const) : ('right' as const),
      };
    });

    return { points, pathD: buildSmoothPath(points), viewBoxWidth: VIEWBOX_WIDTH, totalHeight };
  }, [itemCount, spacing]);
}

/**
 * Builds a single smooth cubic-bezier "snake" through every point.
 * Each segment mirrors its vertical control handles around the midpoint,
 * which produces the alternating S-curve look without ever needing
 * hardcoded per-step coordinates.
 */
function buildSmoothPath(points: RoadmapPoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dy = (p1.y - p0.y) / 2;

    const c1x = p0.x;
    const c1y = p0.y + dy;
    const c2x = p1.x;
    const c2y = p1.y - dy;

    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p1.x} ${p1.y}`;
  }

  return d;
}
