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

export const LANE_CENTER = 500;
const TOP_PADDING = 140;
const BOTTOM_PADDING = 90;

interface UseRoadmapPathOptions {
  itemCount: number;
  spacing: number;
  /** 0 = all centered, 0.56 = current default, >0.75 = near edges */
  laneSpread?: number;
  /** Randomize starting side + add X jitter for organic look */
  randomize?: boolean;
}

interface UseRoadmapPathResult {
  points: RoadmapPoint[];
  pathD: string;
  viewBoxWidth: number;
  totalHeight: number;
}

function seeded(seed: number): number {
  const x = Math.sin(seed * 7919) * 10000;
  return x - Math.floor(x);
}

export function useRoadmapPath({ itemCount, spacing, laneSpread = 0.56, randomize = false }: UseRoadmapPathOptions): UseRoadmapPathResult {
  return useMemo(() => {
    const safeCount = Math.max(itemCount, 0);
    const safeSpacing = Math.max(spacing, 80);

    const laneOffset = Math.round(LANE_CENTER * laneSpread);
    const laneLeftBase = LANE_CENTER - laneOffset;
    const laneRightBase = LANE_CENTER + laneOffset;
    const jitterMax = Math.round(laneOffset * 0.15);

    const totalHeight =
      safeCount <= 1 ? safeSpacing + TOP_PADDING + BOTTOM_PADDING : (safeCount - 1) * safeSpacing + TOP_PADDING + BOTTOM_PADDING;

    const points: RoadmapPoint[] = [];
    for (let i = 0; i < safeCount; i++) {
      if (safeCount === 1) {
        points.push({ x: LANE_CENTER, y: TOP_PADDING, side: 'center' as const });
        break;
      }

      let side: 'left' | 'right';
      if (randomize) {
        side = i === 0
          ? (seeded(itemCount) > 0.5 ? 'right' : 'left')
          : (points[i - 1].side === 'left' ? 'right' : 'left');
      } else {
        side = i % 2 === 0 ? 'left' : 'right';
      }

      const baseX = side === 'left' ? laneLeftBase : laneRightBase;
      const jitter = randomize ? Math.round((seeded(itemCount + i + 2) - 0.5) * 2 * jitterMax) : 0;

      points.push({
        x: baseX + jitter,
        y: TOP_PADDING + i * safeSpacing,
        side,
      });
    }

    return { points, pathD: buildSmoothPath(points), viewBoxWidth: VIEWBOX_WIDTH, totalHeight };
  }, [itemCount, spacing, laneSpread, randomize]);
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
