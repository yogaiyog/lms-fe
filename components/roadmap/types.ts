import type { ReactNode } from 'react';

export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  imageUrl?: string | null;
  /** Any valid CSS color (hex, rgb, hsl...) used for the border, icon and glow */
  color: string;
  completed: boolean;
  locked: boolean;
  current: boolean;
  lessons?: number;
  duration?: string;
}

export interface RoadmapProps {
  items: RoadmapItem[];
  /** Thickness of the road stroke, in SVG viewBox units. Default 80 */
  roadWidth?: number;
  /** Vertical distance between two consecutive steps, in pixels. Default 250 */
  spacing?: number;
  /** Toggle draw-on / fade-in / pulse animations. Default true */
  animated?: boolean;
  /** Base color of the road. Default a soft indigo */
  roadColor?: string;
  /** Randomize starting side + add X jitter for organic look */
  randomize?: boolean;
  /** Called when an unlocked step is activated (click or Enter/Space) */
  onStepSelect?: (item: RoadmapItem) => void;
  className?: string;
}

export type RoadmapSide = 'left' | 'right' | 'center';

export interface RoadmapPoint {
  x: number;
  y: number;
  side: RoadmapSide;
}
